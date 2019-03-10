const _ = require('lodash');

const LOCATION_PROPERTIES = ['f', 'e'];

module.exports = class HTMLElementProxy {
	constructor(data, agent, windowId) {
		this.data = data;
		this.agent = agent;
		this.windowId = windowId;
	}

	get location() {
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
		return this.$alive().call('document.element.css', [this.location, propertyList]);
	}
	
	async getBoundingClientRect() {
		return this.$alive().call('document.element.rect', [this.location]);
	}

	async getAttributes() {
		return this.$alive().call('document.element.attributes', [this.location]);
	}

	async getInnerText() {
		return this.$alive().call('document.element.text', [this.location]);
	}

	async click() {
		return this.$alive().call('document.element.action', [this.location, 'click']);
	}

	async focus() {
		return this.$alive().call('document.element.action', [this.location, 'focus']);
	}

	async blur() {
		return this.$alive().call('document.element.action', [this.location, 'blur']);
	}

	async scrollIntoView() {
		return this.$alive().call('document.element.scroll', [this.location]);
	}

	async setValue(valueString) {
		return this.$alive().call('document.element.css', [this.location, valueString]);
	}
};