const { utils } = require('../');
const Native = require('../interface/native');
const assert = require('assert');
const _ = require('lodash');

const DOC = {
	TITLE: 'Document Root',
	HREF: 'http://localhost:9000/'
};

describe.only('Interface.Native::', function () {
	let native = null;

	this.beforeAll(function () {
		native = new Native(master.agent('main'));
	});

	this.beforeEach(async function () {
		await native.goto('/');
		await utils.wait(2000);
	});

	describe('#title', function () {
		it('should has a string title value', function () {
			assert.equal(native.title, DOC.TITLE);
		});
	});

	describe('#href', function () {
		it('should be a url string', function () {
			assert.equal(native.href, DOC.HREF);
		});
	});

	describe('#ua', function () {
		it('should be a string', function () {
			assert(_.isString(native.ua));
		});
	});

	describe('#eval()', function () {
		it('should return the value', async function () {
			assert.equal(2, await native.eval('1+1'));
		});
	});

	describe('#form()', function () {
		it('should be a new href', async function () {
			await native.form('/', 'get', { test: 1234, abc: 'fsdfsfs' });
			await utils.wait(3000);

			assert.equal(native.href, `${DOC.HREF}?test=1234&abc=fsdfsfs`);
		});
	});

	describe('#cookie()', function () {
		it('could get a string', async function () {
			assert(_.isString(await native.cookie()));
		});
	});

	describe('#goto()', function () {
		it('should be a href string', async function () {
			const value = await native.goto('/?abc=123#top');
			
			assert.equal(value, true);
			await utils.wait(2000);
			assert.equal(native.href, `${DOC.HREF}?abc=123#top`);
		});
	});

	describe('#back()', function () {
		it('should back to correct href', async function () {
			const originHref = native.href;

			await native.goto('/?back=1');
			await utils.wait(2000);
			assert.equal(native.href, `${DOC.HREF}?back=1`);

			await native.back();
			await utils.wait(2000);

			assert.equal(native.href, originHref);
		});
	});

	describe('forward()', function () {
		it('should back to correct href', async function () {
			const originHref = native.href;

			await native.goto('/?back=1');
			await utils.wait(2000);
			assert.equal(native.href, `${DOC.HREF}?back=1`);

			await native.back();
			await utils.wait(2000);
			assert.equal(native.href, originHref);

			await native.forward();
			await utils.wait(2000);
			assert.equal(native.href, `${DOC.HREF}?back=1`);
		});
	});

	describe('#refresh()', function () {
		it('should return true', async function () {
			assert.strictEqual(await native.refresh(), true);
		});
	});

	describe('#selectAll()', function () {
		it('should get 2 element: <p>, <input>', async function () {
			const elementList = await native.selectAll(['p,input']);

			assert.equal(elementList.length, 2);
			assert.equal(elementList[0].tagName, 'INPUT');
			assert.equal(elementList[1].tagName, 'P');
		});

	});

	describe('#selectOne()', function () {
		it('should get one input element', async function () {
			const inputElement = await native.selectOne(['input']);
	
			assert.equal(inputElement.tagName, 'INPUT');
		});
	});

	describe('#getDialog()', function () {
		it('should get a confirm dialog', async function () {
			const button = await native.selectOne(['button#confirm']);
			await button.click();
		
			assert.equal(native.getDialog('confirm').message, 'hello');
		});
	});

	describe('#closeDialog()', function () {
		it('should close a confirm dialog by cancel', async function () {
			const button = await native.selectOne(['button#confirm']);
			await button.click();
		
			assert.equal(native.getDialog('confirm').message, 'hello');
			await native.closeDialog('confirm', false);
		});
	});
});