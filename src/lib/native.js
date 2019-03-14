const HTMLElementProxy = require('./element');
const DEFAULT_ENCODETYPE = 'application/x-www-form-urlencoded';
const DIALOG_TYPE = ['alert', 'confirm', 'prompt'];

module.exports = class Native {
	constructor(agent) {
		this.agent = agent;
	}
	
	get title() {
		return null;
	}

	get href() {
		return null;
	}

	eval(scriptString) {
		return this.agent.call('lang.eval', [scriptString]);
	}

	form(action, method, encodeType = DEFAULT_ENCODETYPE, inputs) {
		return this.agent.call('window.form', [action, method, inputs]);
	}

	cookie() {
		return this.agent.call('window.cookie', []);
	}

	ua() {
		return this.agent.call('window.ua', []);
	}

	to(href) {
		return this.agent.call('navigation.to', [href]);
	}

	back() {
		return this.agent.call('navigation.back', []);
	}

	forward() {
		return this.agent.call('navigation.forward', []);
	}

	refresh() {
		return this.agent.call('navigation.refresh', []);
	}

	async selectAll(selector, filter) {
		const windowId = null;
		const { data: nodeList } = this.agent.call('document.select', [ selector, filter ]);

		return nodeList.map(elementData => new HTMLElementProxy(elementData, this.agent, windowId));
	}

	async selectOne(selector, filter) {
		const nodeList = await this.selectAll(selector, filter);

		return nodeList[0];
	}
	
	closeDialog(type, value) {
		if (!DIALOG_TYPE.find(type)) {
			throw new Error(`Invalid dialog type '${type}'.`);
		}

		const { dialog } = windowModel;

		if (!dialog) {
			throw new Error(`Window(id:${windowModel.id}) is NOT blocked by ${type} dialog.`);
		}

		dialog.value = value;
	}

	upload(URI) {

	}
};