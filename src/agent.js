module.exports = class Agent {
	constructor(master, id) {
		this.id = id;
		this.master = master;
		this.switcher = Agent.SWITCH_NEWEST;
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
						return reject(new Error(`Program(${hash}) has been destroy`));
					}
		
					if (!program.isExited) {
						return watchExit(agent);
					}

					if (program.error) {
						return reject(new Error(program.error.message + JSON.stringify(program)));
					}

					delete masterModel.programs[hash];
					return resolve(program.returnValue);
				});
			}(this));
		});
	}

	static SWITCH_NEWEST(windows) {
		return windows.sort(function (windowModelA, windowModelB) {
			return windowModelB.createdAt - windowModelA.createdAt;
		})[0];
	}
};