const { utils } = require('../');
const Driver = require('../interface/driver');
const Native = require('../interface/native');
const assert = require('assert');

describe('Interface.Driver::', function () {
	let driver = null;
	let native = null;

	this.beforeAll(function () {
		const agent = master.agent('main');

		driver = new Driver(agent);
		native = new Native(agent);
	});

	this.beforeEach(async function () {
		await utils.wait(1000);
		await native.goto('/');
		await utils.wait(1000);
	});

	describe('#check()', function () {
		it('should check in success', async function () {
			await driver.check(['#checkbox-unchecked']);

			const checkbox = await native.selectOne(['#checkbox-unchecked']);

			assert.strictEqual(checkbox.checked, true);
		});

		it('should check the radio in success', async function () {
			await driver.check(['#radio-unchecked']);

			const radio = await native.selectOne(['#radio-unchecked']);

			assert.strictEqual(radio.checked, true);
		});

		it('should NOT check', async function () {
			const checkbox = await native.selectOne(['#checkbox-checked']);

			assert.strictEqual(checkbox.checked, true);
			await driver.check(['#checkbox-checked']);
			assert.strictEqual(checkbox.checked, true);
		});
	});

	describe('#uncheck()', function () {
		it('should uncheck in success', async function () {
			await driver.uncheck(['#checkbox-checked']);

			const checkbox = await native.selectOne(['#checkbox-checked']);

			assert.strictEqual(checkbox.checked, false);
		});

		it('should NOT uncheck', async function () {
			const checkbox = await native.selectOne(['#checkbox-unchecked']);

			assert.strictEqual(checkbox.checked, false);
			await driver.uncheck(['#checkbox-unchecked']);
			assert.strictEqual(checkbox.checked, false);
		});
	});

	describe('#selectByIndex()', async function () {
		it('should select the 2nd <option>', async function () {
			await driver.selectByIndex(['select'], 1);
			const select = await native.selectOne(['select']);

			assert.strictEqual(select.value, '1');
		});
	});

	describe('#selectByValue()', async function () {
		it('should select the 2nd <option>', async function () {
			await driver.selectByValue(['select'], '2');
			const select = await native.selectOne(['select']);

			assert.strictEqual(await select.getPropertyValue('selectedIndex'), 2);
		});
	});

	describe('#input()', function () {
		it('should input in success', async function () {
			await driver.input(['[type=text]'], 'test');

			const textbox = await native.selectOne(['input[type=text]']);

			assert.equal(textbox.value, 'test');
		});
	});

	// describe('#mousedown()', function () {

	// });

	// describe('#mouseup()', function () {

	// });

	describe('#click()', function () {
		it('should uncheck by click', async function () {
			const checkbox = await native.selectOne(['#checkbox-checked']);
	
			assert.strictEqual(checkbox.checked, true);
			await driver.click(['#checkbox-checked']);
			
			const checkboxNext = await native.selectOne(['#checkbox-checked']);
			assert.strictEqual(checkboxNext.checked, false);
		});
	});

	describe('#dblclick()', function () {
		it('should query a <div id="for-dblclick">', async function () {
			await driver.dblclick(['body']);
			
			const element = await native.selectOne(['#for-dblclick']);

			assert(element);
		});

	});

	describe('#contextmenu()', function () {
		it('should query a <div id="for-contextmenu">', async function () {
			await driver.contextmenu(['body']);
			
			const element = await native.selectOne(['#for-contextmenu']);

			assert(element);
		});
	});
});