const assert = require('assert');
const agentMock = require('./utils/mock');

describe('Master', function () {
	this.beforeAll(async () => {
		Master.config({ observerUrl: 'http://127.0.0.1:8080' });
		this.cancelMock = await agentMock();
	});

	it('should create a master successfully', async function () {

		const master = await Master.create();

		assert(master.model);
		assert(master.idle);
		assert(master.assert);
		assert(master.agents);
		assert(master.options);
		assert(master.model);
		assert(master.agents['main']);
		
		assert.equal(master.id, master.model.id);
		assert.equal(master.destroyed, false);
		assert.equal(master.httpAgent.defaults.baseURL,
			'http://127.0.0.1:8080/api/master/' + master.id);

		master.destroy();
	});

	it('should find a agent by default name \'main\'', async function () {
		const master = await Master.create();

		await master.handle('main', () => {});

		await master.destroy();
	});

	it('should not find a agent not existed', async function () {
		const master = await Master.create();

		try {
			await master.handle('notExisted', () => {});
			assert(false);
		} catch (error) {
			assert.equal(error.message, 'The agent named \'notExisted\' is not found.');
		}

		await master.destroy();
	});

	it('should find a agent by specific name \'myWWW\'', async function () {
		const master = await Master.create({
			agents: ['myWWW']
		});

		await master.handle('myWWW', () => {});

		await master.destroy();
	});

	it('should fail when arguments invalid', async function () {
		const master = await Master.create();

		try {
			await master.handle();
			assert(false);
		} catch (error) {
			assert.equal(error.message, 'Agent name NUST be a string.');
		}

		try {
			await master.handle('abc');
			assert(false);
		} catch (error) {
			assert.equal(error.message, 'The 2nd argument MUST be a function.');
		}

		await master.destroy();
	});

	it('should debug master successfully.', async () => {
		const master = await Master.create();

		const result = await master.handle('main', async agent => {
			const start = Date.now();

			await master.idle(3000);
			await master.assert(() => Date.now() > start + 5000, 10000);

			return 'test';
		});

		assert.equal(result, 'test');

		await master.destroy();
	});

	this.afterAll(() => {
		this.cancelMock();
	});
});