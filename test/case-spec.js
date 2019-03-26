const { Master, utils } = require('../');
const Native = require('../interface/native');
const assert = require('assert');

Master.create();

describe('Case::', function () {

	describe('meng', function () {
		let native = null;
	
		this.beforeAll(function () {
			native = new Native(master.agent('main'));
		});

		it('meng', async function () {
			await native.goto('http://www.ruanyifeng.com/home.html');
			await utils.wait(1000);
			await native.refresh();
			await utils.wait(2000);

			console.log(native.title);
			console.log(native.ua);
			console.log(native.href);

			const a = await native.selectOne(['#page-alpha > p:nth-child(1) > a:nth-child(1)']);
			
			await a.scrollIntoView();
			console.log(await a.getInnerText());
			await a.click();
			
			await utils.wait(3000);
			const all = await native.selectOne(['.asset-more-link > p:nth-child(1) > a:nth-child(1)']);
			await all.click();
			
			await utils.wait(2000);
			const h2 = await native.selectOne(['h2'], '二、香港地铁色表');
			await h2.scrollIntoView();
		});
	});

	describe('Native interface::', function () {
		it('debug', async function () {
			const mainAgent = master.agent('main');
			const native = new Native(mainAgent);

			console.log(native.ua, native.href, native.title);
	
			console.log(await native.cookie());

			await native.goto('/');
			await utils.wait(2000);
			await native.refresh();
			await utils.wait(2000);
			await native.goto('/?test=2345');
			await utils.wait(2000);
			await native.back();
			await utils.wait(3000);
	
			assert.equal(native.href, 'http://localhost:9000/');
			
			await native.forward();
			await utils.wait(3000);
			
			assert.equal(native.href, 'http://localhost:9000/?test=2345');
	
			await native.eval(`console.log('test');`);
	
			// const elementList = await native.selectAll(['*', 'a']);

			// await elementList[0].click();
			// console.log(elementList);

			const input = await native.selectOne(['input']);
			console.log(input);
			await input.setValue('test');
	
			await native.form('/', 'get', {
				test: 1234,
				abc: 'fsdfsfs'
			});
		});

	});

});