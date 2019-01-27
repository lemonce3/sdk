const { Driver } = require('./driver');
const { Player } = require('./player');

class AgentError extends Error {}
class AgentProgramError extends Error {}

class Agent extends Driver {

	constructor({ id }, master) {
		super();

		this.master = master;
		this.id = id;
		this.windowIndex = 0;
	}

	async $execute(name, args = []) {
		const agentModel = this.master.model.agents[this.id];
		const { timeout, polling, afterIdle } = this.master.options.program;

		if (!agentModel) {
			throw new AgentError('Agent has been destroyed.');
		}

		const { axios } = this.master;
		const { windows } = agentModel;
		const { data: programModel } = await axios.post([
			`/master/${this.master.id}`,
			`/agent/${this.id}`,
			`/window/${windows[this.windowIndex].id}`,
			'/program'
		].join(''), { name, args, timeout });

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
							return setTimeout(() => resolve(returnValue.value), afterIdle);
						}

						if (Date.now() < timoutTime) {
							return setTimeout(() => programGetter(), polling);
						}
					}, () => {
						reject(new AgentProgramError('Program calling over time.'));
					});
			}());
		});
	}

	switchWindow(index = 0) {
		this.windowIndex = index;
	}

	play(player) {
		if (player) {
			return player.setAgent(this).end();
		}

		const newPlayer = new Player();
		newPlayer.setAgent(this);

		return newPlayer;
	}

}

module.exports = {
	Agent,
	AgentProgramError
};