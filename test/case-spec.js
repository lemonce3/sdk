const { Master, utils } = require('../');
const Native = require('../lib/native');
const assert = require('assert');

Master.create();

describe('Case::', function () {
	describe('Native interface::', function () {
		it('debug', async function () {
			const mainAgent = master.agent('main');
			const native = new Native(mainAgent);

			console.log(native.ua, native.href, native.title);
	
			console.log(await native.cookie());

			await native.goto('/');
			await utils.wait(3000);
			await native.refresh();
			await utils.wait(3000);
			await native.goto('/?test=2345');
			await utils.wait(2000);
			await native.back();
			await utils.wait(3000);
	
			assert.equal(native.href, 'http://localhost:9000/');
			
			await native.forward();
			await utils.wait(2000);
			
			assert.equal(native.href, 'http://localhost:9000/?test=2345');
	
			await native.eval(`console.log('test');`);
	
			const elementList = await native.selectAll(['*', 'a']);
	
			console.log(elementList);
		});
	});
});