const Agent = require('./agent');
const axios = require('axios');

const http = axios.create({
	baseURL: config.observer.url
});

module.exports = class Master {
	constructor(model, agentMap) {
		this.model = model;
		this.agents = agentMap;
		this.callbackList = [];

		this.$keepAliveTimer = null;
		
		(async function keepAlive(master) {
			try {
				const { data: model } = await http.put(`/api/master/${master.model.id}`, master.model);
	
				master.model = model;
	
				const callbackList = master.callbackList;
				master.callbackList = [];
	
				callbackList.forEach(callback => callback(master.model));
				
				master.$keepAliveTimer = setTimeout(() => keepAlive(master), 33);
			} catch (error) {
				return;
			}
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

	static async create(composer) {
		before(async () => {
			const agentList = await this.getAllAgent();
			const agentMap = composer(agentList);

			const { data: masterModel } = await http.post('/api/master', {
				agents: Object.values(agentMap)
			});
	
			global.master = new this(masterModel, agentMap);
		});

		after(async () => {
			await global.master.destroy();
		});
	}

	static async getAllAgent() {
		const { data: agentList } = await http.get('/api/agent');

		return agentList;
	}
}