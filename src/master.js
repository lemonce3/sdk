const EventEmitter = require('events');
const axios = require('axios');
const { Agent, AgentHandleContext } = require('./agent');
const fs = require('fs');

class MasterConnectionError extends Error {}

class Master extends EventEmitter {
	constructor(options) {
		super();

		const {
			observerUrl,
			agentNameList = ['main'],
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
		}, error => {
			this.destroyed = true;
			this.connecting = false;
			this.emit('errpr', error);
			this.emit('destroy');
		});
	}

	async init(nameList) {
		try {
			const { data: masterModel } = await this.axios.post('/master');
			this.connecting = true;
			this.id = masterModel.id;
			this.model = masterModel;

			await Promise.all(nameList.map(name => this.bindAgent(name)));
			
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

	getAgent(name) {
		return this.agents[name];
	}

	async use(agentName, asyncCallback) {
		this.agents[agentName];
		return await asyncCallback();
	}

	async bindAgent(name) {
		const { data: agent } = await this.axios.post(`/master/${this.id}/agent`);

		this.agents[name] = new Agent(agent, this);
	}

	async unbindAgent(name) {
		const { id } = this.agents[name];
		await this.axios.delete(`/master/${this.id}/agent/${id}`);
	}

	async log() {

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

	static use(platform = 'web', driverDefination) {

	}
}

module.exports = {
	Master,
	MasterConnectionError,
};
