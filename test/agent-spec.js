/*eslint no-console: off */
// require('./mock');

describe.skip('Agent', function () {

	let master = null;
	
	before(async function () {
		Master.config({ observerUrl: 'http://127.0.0.1:8080' });
		
		master = await Master.create();
	});

	it('should debug master successfully.', async () => {

		await master.handle('main', async agent => {
			const start = Date.now();
			
			// console.time('t1');
			// const title = await agent.getTitle();
			// console.timeEnd('t1');

			await master.idle(3000);
			await master.assert(() => Date.now() > start + 5000, 10000);

			console.log(a);

		});
	});

	this.afterAll(async () => {
		await master.destroy();
	});
});