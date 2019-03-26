const utils = require('./uitls');
const _ = require('lodash');

module.exports = class Agent {
	constructor(master, id, {
		interval = 10,
		limit = 3000
	} = {}) {
		this.id = id;
		this.master = master;
		this.switcher = Agent.SELETE_NEWEST;

		this.interval = interval;
		this.limit = limit;
	}

	setSwitcher(switcher) {
		this.switcher = switcher;
	}

	get model() {
		return this.master.model.agents[this.id];
	}
	
	get windowModel() {
		return this.switcher(this.model.windows);
	}

	callInTime(name, args, limit = this.limit) {
		if (!_.isNumber(limit) || limit < 1000) {
			throw new Error('Limited time must be a number(>1000).');
		}

		const exitTime = Date.now() + limit;

		return new Promise((resolve, reject) => {
			let lastError = new Error(`Exceeds the maximum limit(${limit}).`);

			(function watchCalling(agent) {
				if (Date.now() > exitTime) {
					return reject(lastError);
				}

				try {
					agent.call(name, args).then(any => resolve(any));
				} catch (error) {
					lastError = error;
					watchCalling();
				}
			}(this));
		});
	}

	call(name, args = []) {
		const hash = Math.random().toString(16).substr(2, 8);

		return new Promise((resolve, reject) => {
			this.master.nextTick(masterModel => {
				masterModel.programs[hash] = {
					hash, name, args, windowId: this.windowModel.id
				};
			});

			(function watchExit(agent) {
				agent.master.nextTick(masterModel => {
					const program = masterModel.programs[hash];

					if (!program) {
						console.log('--')
						return reject(new Error(`Program(${hash}) has been destroy`));
					}
		
					if (!program.isExited) {
						console.log('>>')
						return watchExit(agent);
					}

					if (program.error) {
						console.log('>+')
						return reject(new Error(program.error.message + JSON.stringify(program)));
					}

					console.log('>0')
					delete masterModel.programs[hash];
					return resolve(program.returnValue);
				});
			}(this));
		}).then(data => utils.wait(this.interval).then(() => data));
	}

	static SELETE_NEWEST(windows) {
		return windows.sort(function (windowModelA, windowModelB) {
			return windowModelB.createdAt - windowModelA.createdAt;
		})[0];
	}
};