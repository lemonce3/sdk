const Agent = require('./agent');
const axios = require('axios');

const http = axios.create({
	baseURL: config.observer.url
});

const DEFAULT_SYNC_INTERVAL = 60;

module.exports = class Master {
	constructor(model, agentMap) {
		this.model = model;
		this.callbackList = [];
		this.$keepAliveTimer = null;
		this.$agents = {};

		for(let agentName in agentMap) {
			this.$agents[agentName] = new Agent(this, agentMap[agentName]);
		}
		
		(async function keepAlive(master) {
			try {
				const { data: model } = await http.put(`/api/master/${master.model.id}`, master.model);

				master.model = model;
	
				const callbackList = master.callbackList;
				master.callbackList = [];
	
				callbackList.forEach(callback => callback(master.model));
				
				master.$keepAliveTimer = setTimeout(() => keepAlive(master), DEFAULT_SYNC_INTERVAL);
			} catch (error) {
				return;
			}
		}(this));
	}

	agent(name) {
		return this.$agents[name];
	}

	nextTick(callback) {
		this.callbackList.push(callback);
	}

	destroy() {
		clearTimeout(this.$keepAliveTimer);

		return http.delete(`/api/master/${this.model.id}`);
	}

	static async create(composer = this.GET_LAST_AGENT) {
		before(async () => {
			const agentList = await this.getAllAgent();
			const agentMap = composer(agentList);

			const { data: masterModel } = await http.post('/api/master', {
				agents: Object.values(agentMap)
			});
	
			global.master = new this(masterModel, agentMap);
		});

		after(async () => {
			try {
				await global.master.destroy();
			} catch (err) {
				return;
			}
		});
	}

	static async getAllAgent() {
		const { data: agentList } = await http.get('/api/agent');

		return agentList;
	}

	static GET_LAST_AGENT(agentList) {
		const idleList = agentList
			.filter(agentModel => {
				return agentModel.masterId === null;
			})
			.sort((agentA, agentB) => {
				return agentB.visitedAt - agentA.visitedAt;
			});
	
		if (idleList.length === 0) {
			throw Error('No idle agent now');
		}
	
		return { main: idleList[0].id };
	}
};