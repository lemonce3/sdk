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

const masterGlobal = {
	httpAgent: null
};

class Master extends EventEmitter {
	constructor(options, model) {
		super();

		this.id = model.id;
		this.model = model;
		this.options = options;
		this.httpAgent = axios.create({
			baseURL: `${masterGlobal.httpAgent.defaults.baseURL}/master/${this.id}`
		});
		
		this.agents = {};
		this.destroyed = false;

		this.assert = provideAssert(options.assert.timeout, options.assert.polling);
		this.idle = provideIdle(options.idle.timeout);

		this.$watch();
		this.$watcher = null;
	}

	$watch() {
		return this.httpAgent.get().then(({ data: masterModel }) => {
			if (!this.destroyed) {
				this.model = masterModel;
				this.$watcher = setTimeout(() => this.$watch(), this.options.polling);
			}
		}, () => {
			this.destroyed = true;
			this.emit('error', new MasterConnectionError('Connection is broken and master has been destroyed.'));
			this.emit('destroy');
		});
	}

	async destroy() {
		clearTimeout(this.$watcher);
		await this.httpAgent.delete();
		this.destroyed = true;

		if (this.options.log.saving) {
			const { data: log } = await this.httpAgent.get('/log');
			const filename = path.join(this.options.log.path, `log_${Date.now}.json`);

			await fs.promises.writeFile(filename, JSON.stringify(log));
		}
	}

	async bind(name) {
		const { data: agent } = await this.httpAgent.post('/agent');

		this.agents[name] = new Agent(agent, this);
	}

	async unbind(name) {
		const { id } = this.agents[name];
		await this.httpAgent.delete(`/agent/${id}`);
	}

	async handle(name, fn) {
		if (!_.isString(name)) {
			throw new MasterError('Agent name NUST be a string.');
		}

		if (!_.isFunction(fn)) {
			throw new MasterError('The 2nd argument MUST be a function.');
		}

		const agent = this.agents[name];

		if (!agent) {
			throw new MasterError(`The agent named '${name}' is not found.`);
		}

		try {
			return await fn(this.agents[name], this);
		} catch (error) {
			this.log('master.error', error.message);

			throw error;
		}
	}

	async log(namespace, message) {
		await this.httpAgent.post('/log', { namespace, message });
	}
}

module.exports = {
	Master,
	create(...optionsList) {
		const options = mergeOptions(...optionsList);

		if (!masterGlobal.httpAgent) {
			throw new Error('Master global httpAgent has NOT been set. Master.config() first.');
		}
		
		return masterGlobal.httpAgent.post('/master').then(({ data: model }) => {
			return new Master(options, model);
		}, () => {
			throw new MasterConnectionError('Observer server connection error.');
		}).then(master => {
			return Promise.all(options.agents.map(name => master.bind(name))).then(() => {
				return master;
			}, () => {
				throw new MasterBindingError('No idle agent could be binded.');
			});
		});
	},
	config({ observerUrl }) {
		try {
			new URL(observerUrl);
		} catch (error) {
			throw new Error('Property observerUrl in argument 0 MUST be a url string.');
		}

		masterGlobal.httpAgent = axios.create({
			baseURL: `${observerUrl}/api`
		});
	}
};
