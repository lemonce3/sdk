const _ = require('lodash');

const LOCATION_PROPERTIES = ['f', 'e'];

const textStyleInputElement = [
	// Typical text style.
	'text', 'password', 'email', 'search', 'tel', 'url',
	// Widget style
	'number', 'color', 'range',
	// date
	'date', 'month', 'week', 'time', 'datetime', 'datetime-local'
];

module.exports = class HTMLElementProxy {
	constructor(data, agent, windowId) {
		this.data = data;
		this.agent = agent;
		this.windowId = windowId;
	}

	get type() {
		return this.data.t || undefined;
	}

	get value() {
		return this.data.v || undefined;
	}

	get hash() {
		return _.pick(this.data, LOCATION_PROPERTIES);
	}

	get tagName() {
		return this.data.n;
	}

	$alive() {
		if (!this.agent.model.windows.find(window => window.id === this.windowId)) {
			throw new Error('Window is gone.');
		}

		return this.agent;
	}

	async getComputedStyle(propertyList) {
		return this.$alive().call('document.element.css', [this.hash, propertyList]);
	}
	
	async getBoundingClientRect() {
		return this.$alive().call('document.element.rect', [this.hash]);
	}

	async getAttributes() {
		return this.$alive().call('document.element.attributes', [this.hash]);
	}

	async getInnerText() {
		return this.$alive().call('document.element.text', [this.hash]);
	}

	async click() {
		return this.$alive().call('document.element.action', [this.hash, 'click']);
	}

	async focus() {
		return this.$alive().call('document.element.action', [this.hash, 'focus']);
	}

	async blur() {
		return this.$alive().call('document.element.action', [this.hash, 'blur']);
	}

	async scrollIntoView() {
		return this.$alive().call('document.element.scroll', [this.hash]);
	}

	async setValue(valueString) {
		return this.$alive().call('document.element.css', [this.hash, valueString]);
	}

	async getParent() {
		const {
			data: elementData
		} = await this.$alive().call('document.element.parent', [this.hash]);

		return new HTMLElementProxy(elementData, this.agent, this.windowId);
	}

	static isElement(any) {
		return any instanceof this;
	}

	static assertCheckable(element) {
		if (this.isElement(element) &&
			element.tagName === 'INPUT' &&
			(element.type === 'radio' || element.type === 'checkbox')) {
			return;
		}

		throw new Error('The element do NOT support uncheck, <input type="radio|checkbox" /> expected.');
	}
	
	static assertSelectable(element) {
		if (element.tagName !== 'SELECT') {
			throw new Error('The element do NOT support select, <select> expected.');
		}
	}
	
	static assertInputable(element) {
		if (!this.isElement(element) ||
			element.tagName !== 'INPUT' ||
			textStyleInputElement.indexOf(element.type) === -1) {
				
			throw new Error('The element do NOT support input, <input type="text|..." />. expected.');
		}
	}
};