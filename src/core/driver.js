function Driver() {}

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
	getHref: 'navigation.href',
	to: 'navigation.to',
	back: 'navigation.back',
	forward: 'navigation.forward',
	refresh: 'navigation.refresh',
	mouseClick: 'driver.mouse.click',
	mouseDblclick: 'driver.mouse.dblclick',
	mouseHold: 'driver.mouse.hold',
	mouseDrop: 'driver.mouse.drop',
	mouseWheel: 'driver.mouse.wheel',
	inputText: 'driver.input.text',
	checkBox: 'driver.input.box',
	select: 'driver.select',
	scroll: 'driver.scroll',
};

for (const name in methodMapping) {
	Driver.prototype[name] = async function (...args) {
		return await this.$execute(methodMapping[name], Array.from(args));
	};
}

Driver.prototype.$ = async function querySelector(...args) {
	const result = await this.$execute('document.select', Array.from(args));

	return result;
};

module.exports = {
	Driver
};