const { Driver } = require('./driver');

class AgentError extends Error {}
class AgentLifecycleError extends Error {}
class AgentProgramError extends Error {}

class Agent extends Driver {

	constructor({ id }, master) {
		super();

		this.master = master;
		this.id = id;
	}

	idle(time) {
		if (typeof time !== 'number' || time < 0) {
			throw new AgentError('A valid time value excepted, number & greater than 0ms.');
		}

		return new Promise(resolve => setTimeout(() => resolve(), time));
	}

	async assert(expression, limit = this.master.options.defaultAssertTimeout) {
		const timoutTime = Date.now() + limit;

		if (typeof expression !== 'function') {
			throw new AgentError('Assertion expression must be a function.');
		}
		
		return new Promise((resolve, reject) => {
			(async function expressionWatcher() {
				if (Date.now() > timoutTime) {
					return reject(new AgentError('Assertion failed.'));
				}

				try {
					if (await expression()) {
						return resolve();
					}
				} finally {
					setTimeout(() => expressionWatcher(), 50);
				}
			}());
		});
	}

	async execute(name, args = [], timeout = 3000) {
		const agentModel = this.master.model.agents[this.id];

		if (!agentModel) {
			throw new AgentLifecycleError('Agent has been destroyed.');
		}

		const { axios } = this.master;
		const { windows } = agentModel;
		const url = `/master/${this.master.id}/agent/${this.id}/window/${windows[0].id}/program`;
		const { data: programModel } = await axios.post(url, {
			name, args, timeout
		});

		return await new Promise((resolve, reject) => {
			const timoutTime = Date.now() + timeout;

			(function programGetter() {
				return axios.get(`/program/${programModel.id}`)
					.then(({ data: programModel }) => {
						const { error, returnValue } = programModel;

						if (error) {
							return reject(error);
						}

						if (returnValue) {
							return resolve(returnValue.value);
						}

						if (Date.now() < timoutTime) {
							return setTimeout(() => programGetter(), 5);
						}
					}, () => {
						reject(new Error('Program calling over time.'));
					});
			}());
		});
	}
}

module.exports = {
	Agent,
	AgentLifecycleError,
	AgentProgramError
};