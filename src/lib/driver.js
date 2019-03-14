const Native = require('./native');
const HTMLElementProxy = require('./element');
const _ = require('lodash');

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

	async $getElement(arg, callback) {
		if (HTMLElementProxy.isElement(arg)) {
			return arg;
		}

		if (_.isString(arg)) {
			throw new TypeError('String is expected.');
		}

		const element = await this.native.selectOne(arg);

		return callback(element);
	}

	async check(selector) {
		const target = await this.native.selectOne(selector);

		HTMLElementProxy.assertCheckable(target);
		
		if (target.value === false) {
			await this.driver.click(target.location);
			await target.setValue(true);
		}
	}

	async uncheck(selector) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			HTMLElementProxy.assertCheckable(target);

			if (target.value === true) {
				await this.driver.click(target.location);
				await target.setValue(false);
			}
		});
	}

	async select(selector, index) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);
			
			HTMLElementProxy.assertSelectable(target);

			await this.driver.click(target.location);
			await target.setValue(valueString);
		});
	}

	async input(selector, valueString) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			await this.driver.click(target.location);
			await target.setValue(valueString);
		});
	}
}

['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mousemove'].forEach(methodName => {
	Driver.prototype[methodName] = function (elementOrSelector = null) {
		return this.$getElement(elementOrSelector, element => {
			return this.agent.call(`driver.${methodName}`, [
				element.location,
				this.pointer.offset
			]);
		});
	};
});

['keydown', 'keyup', 'keypress'].forEach(methodName => {
	Driver.prototype[methodName] = function (code, char) {
		return this.agent.call(`driver.${methodName}`, [code, char]);
	};
});

module.exports = Driver;