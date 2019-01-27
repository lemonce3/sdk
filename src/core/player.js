const _ = require('lodash');

function Action() {}

Object.assign(Action.prototype, {
	submit: 'submit',
	click: 'mouseClick',
	dblclick(agent) {
		agent.mouseClick('left', 2);
	},
	rightclick(agent) {
		agent.mouseClick('right');
	},
	type: 'inputText',
	check: 'inputBox',
	uncheck: 'inputBox',
	hold: 'mouseHold',
	move: 'mouseMove',
	drop: 'mouseDrop',
	wheel: 'mouseWheel',
	scroll: 'scroll',
	to: 'to',
	back: 'back',
	forward: 'forward',
	refresh: 'refresh',
	wait() {

	},
	upload: 'upload'
});

class Player extends Action{
	constructor(agent) {
		super();

		this.agent = agent;
		this.actionList = [];
	}

	$push(name, args = []) {
		this.actionList.push(name, args);

		return this;
	}

	setAgent(agent) {
		this.agent = agent;

		return this;
	}

	switchWindow(index) {
		this.agent.switchWindow(index);
	}
	
	async end() {
		while(!_.isEmpty(this.actionList)) {
			const action = this.actionList.shift();

			await this.agent.$execute(action);
		}

		return true;
	}
}

module.exports = {
	Player
};