const _ = require('lodash');

function defaultTransform(value) {
	return value;
}

function Driver() {}

function normalize(value) {
	if (_.isString(value)) {
		return { id: value, transform: defaultTransform };
	}

	return value;
}

const methodMapping = {
	eval: 'lang.eval',
	submit: 'window.form.submit',
	screenshot: 'window.screenshot',
	getUserAgent: 'window.ua',
	getCookie: 'window.cookie',
	getAlertMessage: 'window.alert',
	getConfirmMessage: 'window.confirm',
	getPromtMessage: 'window.promt',
	getTitle: 'navigation.title',
	getHref: {
		id: 'navigation.href',
		transform(returnValue) {
			return new URL(returnValue);
		}
	},
	$: {
		id: 'document.select',
		transform(returnValue, agent) {

		}
	},
	to: 'navigation.to',
	back: 'navigation.back',
	forward: 'navigation.forward',
	refresh: 'navigation.refresh',
	mouseClick: 'driver.mouse.click',
	mouseHold: 'driver.mouse.hold',
	mouseDrop: 'driver.mouse.drop',
	mouseWheel: 'driver.mouse.wheel',
	inputText: 'driver.input.text',
	checkBox: 'driver.input.box',
	select: 'driver.select',
	scroll: 'driver.scroll'
};

for (const name in methodMapping) {
	const { id, transform } = normalize(methodMapping[name]);

	Driver.prototype[name] = async function (...args) {
		return transform(await this.$execute(id, Array.from(args)), this);
	};
}

module.exports = {
	Driver
};