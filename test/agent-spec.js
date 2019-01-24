const { Master } = require('../src/master');
const axios = require('axios');

describe('Agent', function () {
	this.beforeAll(async () => {
		const api = axios.create({
			baseURL: 'http://127.0.0.1:8080/api'
		});
	
		const { headers } = await api.get('/agent/fetch');
		const agentId = headers['set-cookie'][0].match(/=([0-9a-z]{40})/)[1];

		const { data: window } = await api.post(`/agent/${agentId}/window`);
		const windowId = window.id;

		setInterval(async () => {
			try {

				await api.get(`/agent/${agentId}/window/${windowId}`);
			} catch (error) {
				process.exit(1);
			}
		}, 2000);
		
		try {
			this.master = await Master.create({
				observerUrl: 'http://127.0.0.1:8080',
				agentNameList: ['main']
			});
		} catch (error) {
			console.log(error);
		}
	});

	it('should debug master successfully.', async () => {
		const main = this.master.getAgent('main');

		try {
			await main.getTitle();
		} catch(error) {
			console.log(error);
		}


		console.log(1111)
	});

	this.afterAll(async () => {
		// await this.master.destroy();
	});
});