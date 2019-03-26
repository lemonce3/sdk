const Native = require('./native');
const HTMLElementProxy = require('./element');
const _ = require('lodash');

const DEFAULT_MOUSE_EVENT_INITS = {
	bubbles: true, cancelable: true,
	button: 0,
	buttons: 0o001,
	screenX: 0,
	screenY: 0,
	clientX: 0,
	clientY: 0,
	altKey: false,
	ctrlKey: false,
	metaKey: false,
	shiftKey: false
};

class Driver {
	constructor(agent) {
		this.agent = agent;
		this.native = new Native(agent);
		this.pointer = {
			offset: [.5, .5]
		};
	}

	setPointerOffsetInElement([x, y]) {
		this.pointer.offset = [x, y];
	}

	async getUniqueTargetElement(arg) {
		if (_.isArray(arg)) {
			const element =  this.native.selectOne(arg);

			if (!element) {
				throw new Error('Element is NOT found.');
			}

			return element;
		}

		return arg;
	}

	async check(target) {
		const element = await this.getUniqueTargetElement(target);

		HTMLElementProxy.assertCheckable(element);
		
		if (element.checked === false) {
			await this.click(element);
		}
	}

	async uncheck(target) {
		const element = await this.getUniqueTargetElement(target);

		HTMLElementProxy.assertCheckable(element);

		if (element.checked === true) {
			await this.click(element);
		}
	}

	async selectByIndex(target, index) {
		const element = await this.getUniqueTargetElement(target);
		
		HTMLElementProxy.assertSelectable(element);

		await this.click(element);
		await element.setPropertyValue('selectedIndex', index);
		await this.click(element);
	}

	async selectByValue(target, valueString) {
		const element = await this.getUniqueTargetElement(target);
		
		HTMLElementProxy.assertSelectable(element);

		await this.click(element);
		await element.setValue(valueString);
		await this.click(element);
	}

	async input(target, valueString) {
		if (!_.isString(valueString)) {
			throw new Error('Determined string datatype expected.');
		}

		const element = await this.getUniqueTargetElement(target);

		await this.click(element);
		await element.setValue(valueString);
	}
}

['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mousemove'].forEach(actionName => {
	Driver.prototype[actionName] = async function (target) {
		const element = await this.getUniqueTargetElement(target);

		return this.agent.call('driver.mouse', [
			element.hash,
			actionName,
			DEFAULT_MOUSE_EVENT_INITS
		]);
	};
});

['keydown', 'keyup', 'keypress'].forEach(methodName => {
	Driver.prototype[methodName] = function (code, char) {
		return this.agent.call(`driver.keyboard.${methodName}`, [code, char]);
	};
});

module.exports = Driver;