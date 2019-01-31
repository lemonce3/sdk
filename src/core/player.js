const _ = require('lodash');

const agentMethodMapping = {
	submit: 'submit',
	scroll: 'scroll',
	upload: 'upload',

	click: 'mouseClick',
	dblclick: 'mouseDblclick',
	hold: 'mouseHold',
	move: 'mouseMove',
	drop: 'mouseDrop',
	wheel: 'mouseWheel',

	type: 'inputText',
	check: 'inputBox',
	uncheck: 'inputBox',
	select: 'select',

	to: 'to',
	back: 'back',
	forward: 'forward',
	refresh: 'refresh',

	screenshot: 'screenshot'
};

class Player {
	constructor() {
		this.agent = null;
		this.actionList = [];
	}

	$push(name, args = []) {
		this.actionList.push([name, args]);

		return this;
	}

	setAgent(agent) {
		this.agent = agent;

		return this;
	}

	switchWindow(index) {
		this.agent.switchWindow(index);
	}

	wait(timeout) {
		return function () {
			return new Promise(resolve => setTimeout(() => resolve(), timeout));
		};
	}
	
	async end() {
		while(!_.isEmpty(this.actionList)) {
			const invoking = this.actionList.shift();

			if (_.isFunction(invoking)) {
				return await invoking();
			}
			
			const { method, args } = invoking;

			if (_.isString()) {
				return await this.agent[method](...args);
			}
		}

		return true;
	}
}

for(const methodName in agentMethodMapping) {
	Player.prototype[methodName] = function (...args) {
		this.$push(agentMethodMapping[methodName], Array.from(args));
	};
}

module.exports = {
	Player
};