const Native = require('./native');
const Driver = require('./driver');
const utils = require('../uitls');

class ActionQueue {
	constructor(agent) {
		this.agent = agent;
		this.driver = new Driver(agent);
		this.native = new Native(agent);

		this.promise = Promise.resolve();
		this.isEnd = false;
	}

	$then(promise) {
		if (this.isEnd) {
			throw new Error('Could NOT add new action when the queue is end.');
		}

		this.promise = this.promise.then(() => promise);

		return this;
	}

	async $getOneElement(selector) {
		const [target] = await this.native.selectAll(selector);

		if (!target) {
			throw new Error('Target element is NOT found.');
		}

		return target;
	}

	to(URL) {
		return this.$then(this.native.to(URL));
	}

	back() {
		return this.$then(this.native.back());
	}

	forward() {
		return this.$then(this.native.forward());
	}

	refresh() {
		return this.$then(this.native.refresh());
	}

	click(selector) {
		return this.$then(this.driver.click(selector));
	}

	dblclick(selector) {
		return this.$then(this.driver.dblclick(selector));
	}

	contextmenu(selector) {
		return this.$then(this.driver.contextmenu(selector));
	}

	mousedown(selector) {
		return this.$then(this.driver.mousedown(selector));
	}

	mouseup(selector) {
		return this.$then(this.driver.mouseup(selector));
	}

	moveTo(selector) {
		return this.$then(this.driver.moveTo(selector));
	}

	keydown(code) {
		return this.$then(this.driver.keydown(code));
	}

	keyup(code) {
		return this.$then(this.driver.keyup(code));
	}

	keypress(code) {
		return this.$then(this.driver.keypress(code));
	}

	check(selector) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			//TODO 如果值不变 不补全操作
			await this.driver.click(target.location);
			await target.setValue(true);
		});
	}

	uncheck(selector) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			//TODO 如果值不变 不补全操作
			await this.driver.click(target.location);
			await target.setValue(false);
		});
	}

	select(selector, index) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			await this.driver.click(target.location);
			//TODO 检查是不是
			await target.setValue(valueString);
		});
	}

	input(selector, valueString) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			await this.driver.click(target.location);
			await target.setValue(valueString);
		});
	}
	
	upload(fileList) {
		//TODO

	}

	scrollTo(selector) {
		return this.$then(async () => {
			const target = await this.$getOneElement(selector);

			await target.scrollIntoView();
		});
	}

	close(type, value) {
		return this.$then(this.native.closeDialog(type, value));
	}

	wait(timeout) {
		return this.$then(utils.wait(timeout));
	}

	end() {
		this.isEnd = true;

		return this.promise;
	}
};

exports.play = function play(agent) {
	return new ActionQueue(agent);
};