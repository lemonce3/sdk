/*eslint no-console: off */

const { Master } = require('../src/master');

describe('Agent', function () {
	this.beforeAll(async () => {
		this.master = await Master.create({
			observerUrl: 'http://127.0.0.1:8080',
			agentNameList: ['main']
		});
	});

	it('should debug master successfully.', async function () {

		await master.handle('main', async ({agent, idle, assert}) => {
			
			console.time('t1');
			const title = await agent.getTitle();
			console.timeEnd('t1');

			console.log(title);

		});
	});

	this.afterAll(async () => {
		await this.master.destroy();
	});
});