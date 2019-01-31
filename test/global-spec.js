const assert = require('assert');

describe('Global', function () {
	it('should Master identifier be existed in global.', function () {
		assert(Master);
		assert(Master.config);
		assert(Master.create);
	});

	it('should throw exception when creating before config.', function () {
		assert.throws(() => {
			Master.create();
		}, {
			message: 'Master global httpAgent has NOT been set. Master.config() first.'
		});
	});

	it('should throw exception when observerUrl invalid', function () {
		assert.throws(() => {
			Master.config({});
		});

		assert.throws(() => {
			Master.config({ observerUrl: '/aabae?dfdsf' });
		});

		assert.throws(() => {
			Master.config({ observerUrl: 1234 });
		});
	});

	it('should no exception when config', function () {
		Master.config({ observerUrl: 'http://127.0.0.1' });
	});

	it('should be fail when observer server is unreachable', async function () {
		Master.config({ observerUrl: 'http://127.0.0.21:8081' });

		try {
			await Master.create();
			assert(false);
		} catch (error) {
			assert.equal(error.message, 'Observer server connection error.');
		}
	});

	it('should be fail when no idle agent', async function () {
		Master.config({ observerUrl: 'http://127.0.0.1:8080' });

		try {
			await Master.create();
			assert(false);
		} catch (error) {
			assert.equal(error.message, 'No idle agent could be binded.');
		}
	});

});