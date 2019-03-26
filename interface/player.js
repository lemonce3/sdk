const Native = require('./native');
const Driver = require('./driver');
const utils = require('../uitls');

module.exports = class ActionQueue {
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

	// mousedown(selector) {
	// 	return this.$then(this.driver.mousedown(selector));
	// }

	// mouseup(selector) {
	// 	return this.$then(this.driver.mouseup(selector));
	// }

	// moveTo(selector) {
	// 	return this.$then(this.driver.moveTo(selector));
	// }

	// keydown(code, char) {
	// 	return this.$then(this.driver.keydown(code, char));
	// }

	// keyup(code, char) {
	// 	return this.$then(this.driver.keyup(code, char));
	// }

	// keypress(code, char) {
	// 	return this.$then(this.driver.keypress(code, char));
	// }

	check(selector) {
		return this.$then(this.driver.check(selector));
	}

	uncheck(selector) {
		return this.$then(this.driver.uncheck(selector));
	}

	select(selector, index) {
		return this.$then(this.driver.select(selector, index));
	}

	input(selector, valueString) {
		return this.$then(this.driver.input(selector, valueString));
	}
	
	upload(fileList) {
		//TODO

	}

	scroll(selector) {
		return this.$then(async () => {
			const target = await this.native.selectOne(selector);

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

	static play(agent) {
		return new this(agent);
	}
};