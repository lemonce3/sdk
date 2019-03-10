const Agent = require('./agent');
const axios = require('axios');

const http = axios.create({
	baseURL: config.observer.url
});

module.exports = class Master {
	constructor(model, agentMap) {
		this.model = model;
		this.agents = {};
		this.callbackList = [];

		this.$keepAliveTimer = null;
		
		(async function keepAlive(master) {
			const model = await http.put(`/api/master/${master.model.id}`, master.model);

			master.model = model;

			const callbackList = master.callbackList;
			master.callbackList = [];

			callbackList.forEach(callback => callback(master.model));
			
			master.$keepAliveTimer = setTimeout(() => keepAlive(master), 33);
		}(this));
	}

	getAgent(agentId) {
		return new Agent(this, agentId);
	}

	nextTick(callback) {
		this.callbackList.push(callback);
	}

	destroy() {
		clearTimeout(this.$keepAliveTimer);

		return http.delete(`/api/master/${this.model.id}`);
	}

	static async create(agentMap) {
		const { data: masterModel } = await http.post('/api/master', Object.values(agentMap));

		return new this(masterModel, agentMap);
	}

	static async getAllAgent() {
		const { data: agentList } = await http.get('/api/agent');

		return agentList;
	}
}