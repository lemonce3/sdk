const EventEmitter = require('events');
const axios = require('axios');
const { Agent } = require('./agent');
const { Driver } = require('./driver');
const fs = require('fs');

class MasterConnectionError extends Error {}
class MasterBindingError extends Error {}

class Master extends EventEmitter {
	constructor(options, agentNameList= ['main']) {
		super();

		const {
			observerUrl,
			programTimeout = 3000,
			assertTimeout = 3000,
			watchInterval = 50,
			saveLog = false,
			logSavingPath = ''
		} = options;

		this.id = null;
		this.model = null;
		this.options = options;
		this.axios = axios.create({
			baseURL: `${observerUrl}/api`,
			timeout: 1000
		});

		this.agents = {};
		this.destroyed = false;
		this.connecting = false;

		this.init(agentNameList);
	}

	$watch() {
		return this.axios.get(`/master/${this.id}`).then(({ data: masterModel }) => {
			if (this.destroyed) {
				return;
			}

			this.model = masterModel;
			setTimeout(() => this.$watch(), this.options.watchInterval);
		}, () => {
			this.destroyed = true;
			this.connecting = false;
			this.emit('error', new MasterConnectionError('Connection is broken and master has been destroyed.'));
			this.emit('destroy');
		});
	}

	async init(nameList) {
		try {
			const { data: masterModel } = await this.axios.post('/master');
			this.connecting = true;
			this.id = masterModel.id;
			this.model = masterModel;

			try {
				await Promise.all(nameList.map(name => this.bind(name)));
			} catch (error) {
				throw new MasterBindingError('No idle agent could be binded.');
			}
			
			await this.$watch();
			this.emit('ready', this);
		} catch (error) {
			this.emit('error', error);
		}
	}

	async destroy() {
		await this.axios.delete(`/master/${this.id}`);
		this.destroyed = true;

		if (this.options.saveLog) {
			await this.saveLog();
		}
	}

	async bind(name) {
		const { data: agent } = await this.axios.post(`/master/${this.id}/agent`);

		this.agents[name] = new Agent(agent, this);
	}

	async unbind(name) {
		const { id } = this.agents[name];
		await this.axios.delete(`/master/${this.id}/agent/${id}`);
	}

	getAgent(name) {
		return this.agents[name];
	}

	async log(namespace, message) {

	}

	async saveLog(pathname) {

	}

	static create(options, scenarioBuilder) {
		return new Promise((resolve, reject) => {
			const master = new this(options);

			master.on('ready', () => resolve(master));
			master.on('error', error => reject(error));
		});
	}

	static use(install) {
		install(Driver.prototype);
	}
}

module.exports = {
	Master,
	MasterConnectionError,
};
