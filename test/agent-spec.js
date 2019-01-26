const { Master } = require('../src/master');
const axios = require('axios');

describe('Agent', function () {
	this.beforeAll(async () => {
		const api = axios.create({
			baseURL: 'http://127.0.0.1:8080/api'
		});
		axios.get('https://ebank.eximbank.gov.cn/eweb/GenTokenImg.do', {
			params: {
				random: Math.random()
			}
		}).then(({data}) => {
			console.log(data);
		});
	
		// const { headers } = await api.get('/agent/fetch');
		// const agentId = headers['set-cookie'][0].match(/=([0-9a-z]{40})/)[1];

		// const { data: window } = await api.post(`/agent/${agentId}/window`);
		// const windowId = window.id;

		// setInterval(async () => {
		// 	try {

		// 		await api.get(`/agent/${agentId}/window/${windowId}`);
		// 	} catch (error) {
		// 		process.exit(1);
		// 	}
		// }, 2000);
		
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
			while(1) {
				console.time('t1');
				const title = await main.getTitle();
				console.timeEnd('t1');
			}

			// console.log(title);

			// await main.idle(3000);

			// console.time('t2');
			// const title2 = await main.getTitle();
			// console.timeEnd('t2');

			// console.log(title2);
		} catch(error) {
			console.log(error);
		}
	});

	this.afterAll(async () => {
		await this.master.destroy();
	});
});