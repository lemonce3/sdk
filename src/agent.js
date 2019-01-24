const assert = require('assert');

function Driver() {}

class Agent extends Driver {

	constructor({ id }, master) {
		super();

		this.master = master;
		this.id = id;
	}

	get windows() {
		return this.master.model.agents[this.id].windows;
	}

	get axios() {
		return this.master.axios;
	}

	async execute(name, args, timeout = 1000) {
		const url = `/master/${this.master.id}/agent/${this.id}/window/${this.windows[0].id}/program`;
		const { data: programModel } = await this.axios.post(url, {
			name, args, timeout
		});

		return await new Promise((resolve, reject) => {
			const timoutTime = Date.now() + timeout;
			const { axios } = this;

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
							return setTimeout(() => programGetter(), 50);
						}
					}, () => {
						reject(new Error('Program calling over time.'));
					});
			}());
		});
	}
}

class AgentHandleContext {

	constructor(agent) {
		this.agent = agent;
		this.driver = {};
	}

	timeout(time) {
		assert(typeof time === 'number');
		assert(time > 0);

		return new Promise(resolve => setTimeout(() => resolve(), time));
	}

	assert(expression, limit) {

	}

	static use(driver) {

	}
}

module.exports = {
	Agent,
	AgentHandleContext,
};

Driver.prototype.getTitle = async function () {
	return await this.execute('page.getTitle', []);
};