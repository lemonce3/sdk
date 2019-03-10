module.exports = class Driver {
	constructor(agent) {
		this.agent = agent;
	}

	click() {
		return this.$then(this.driver)
	}

	dblclick() {

	}

	contextmenu() {

	}

	mousedown() {

	}

	mouseup() {

	}

	moveTo() {

	}

	keydown(code) {

	}

	keyup(code) {

	}

	keypress(code) {

	}
};