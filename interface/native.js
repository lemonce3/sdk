const axios = require('axios');
const HTMLElementProxy = require('./element');
const DEFAULT_ENCODETYPE = 'application/x-www-form-urlencoded';
const DIALOG_TYPE = ['alert', 'confirm', 'prompt'];

const http = axios.create({
	baseURL: config.observer.url
});

module.exports = class Native {
	constructor(agent) {
		this.agent = agent;
	}
	
	get title() {
		return this.agent.windowModel.meta.title;
	}

	get href() {
		return this.agent.windowModel.meta.URL;
	}
	
	get ua() {
		return this.agent.model.ua;
	}

	eval(scriptString) {
		return this.agent.call('lang.eval', [scriptString]);
	}

	form(action, method, inputs, { encodeType = DEFAULT_ENCODETYPE } = {}) {
		return this.agent.callInTime('window.form', [action, method, inputs]);
	}

	cookie() {
		return this.agent.call('window.cookie', []);
	}

	goto(href) {
		return this.agent.callInTime('navigation.to', [href]);
	}

	back() {
		return this.agent.callInTime('navigation.back', []);
	}

	forward() {
		return this.agent.callInTime('navigation.forward', []);
	}

	refresh() {
		return this.agent.callInTime('navigation.refresh', []);
	}

	async selectAll(selector, filter) {
		const { id, doc } = this.agent.windowModel;
		const nodeList = await this.agent.call('document.select', [ selector, filter ]);

		return nodeList.map(elementData => new HTMLElementProxy(elementData, this.agent, id, doc));
	}

	async selectOne(selector, filter) {
		const nodeList = await this.selectAll(selector, filter);

		return nodeList[0];
	}

	getDialog(type) {
		const windowModel = this.agent.windowModel;

		return windowModel.dialog[type];
	}
	
	closeDialog(type, value) {
		if (DIALOG_TYPE.indexOf(type) === -1) {
			throw new Error(`Invalid dialog type '${type}'.`);
		}

		return new Promise((resolve, reject) => {
			const windowModel = this.agent.windowModel;
			const dialog = windowModel.dialog[type];

			if (dialog === null) {
				return reject(new Error(`Window(id:${windowModel.id}) is NOT blocked by ${type} dialog.`));
			}

			dialog.value = value;

			this.agent.master.nextTick(() => {
				resolve();
			});
		});
	}

	async upload(fileList) {
		if (!this.agent.windowModel.upload.pending) {
			throw new Error('The window is NOT on uploading.');
		}

		fileList.forEach(file => {
			file.hash = Math.random().toString(16).substr(2, 8);
		});

		await Promise.all(fileList.map(file => {
			return http.post('/api/file', file.blob, {
				params: {
					hash: file.hash
				},
				headers: {
					'Content-Type': file.type
				}
			});
		}));

		return this.agent.call('window.upload', [
			fileList.map(file => {
				return {
					name: file.name,
					hash: file.hash
				};
			})
		]);
	}
};