const EventEmitter = require('events');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const _ = require('lodash');

const { Agent } = require('./agent');
const mergeOptions = require('../options/merge');
const { provideAssert, provideIdle } = require('../utils');

class MasterConnectionError extends Error {}
class MasterBindingError extends Error {}
class MasterError extends Error {}

class Master extends EventEmitter {
	constructor(options) {
		super();

		const { observerUrl, agents } = options;

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

		this.assert = provideAssert(options.assert.timeout);
		this.idle = provideIdle(options.idle.timeout);

		this.init(agents);
	}

	$watch() {
		return this.axios.get(`/master/${this.id}`).then(({ data: masterModel }) => {
			if (this.destroyed) {
				return;
			}

			this.model = masterModel;
			setTimeout(() => this.$watch(), this.options.polling);
		}, () => {
			this.destroyed = true;
			this.connecting = false;
			this.emit('error', new MasterConnectionError('Connection is broken and master has been destroyed.'));
			this.emit('destroy');
		});
	}

	async init(nameList) {
		try {
			fs.ensureDirSync(this.options.log.path);

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

		if (this.options.log.saving) {
			const { data: log } = await this.axios.get(`/master/${this.id}/log`);
			const filename = path.join(this.options.log.path, `log_${Date.now}.json`);

			await fs.promises.writeFile(filename, JSON.stringify(log));
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

	async handle(name, fn) {
		if (!_.isString(name)) {
			throw new MasterError('Agent name NUST be a string.');
		}

		if (!_.isFunction(fn)) {
			throw new MasterError('The 2nd argument MUST be a function.');
		}

		const agent = this.agents[name];

		if (_.isUndefined(agent)) {
			throw new MasterError(`The agent named ${name} has been removed.`);
		}

		try {
			await fn({
				agent,
				idle: this.idle,
				assert: this.assert,
				master: this
			});

			return true;
		} catch (error) {
			this.log('master.error', JSON.stringify(error));

			return false;
		}
	}

	async log(namespace, message) {
		await this.axios.post(`/master/${this.id}/log`, { namespace, message });
	}

	static create(...optionsList) {
		return new Promise((resolve, reject) => {
			const master = new this(mergeOptions(...optionsList));

			master.on('ready', () => resolve(master));
			master.on('error', error => reject(error));
		});
	}
}

module.exports = {
	Master,
	MasterConnectionError,
};
