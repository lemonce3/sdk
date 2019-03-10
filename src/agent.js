module.exports = class Agent {
	constructor(master, id) {
		this.id = id;
		this.master = master;
		this.switcher = () => 0;
	}

	setSwitcher(switcher) {
		this.switcher = switcher;
	}

	get model() {
		return this.master.model.agents[this.id];
	}
	
	get $windowModel() {
		return this.switcher(this.model.windows);
	}

	call(name, args = []) {
		const windowModel = this.$windowModel;
		const { program } = windowModel;
		const hash = Math.random().toString(16).sub(2, 4);

		program.name = name;
		program.args = args;
		program.hash = hash;
		program.isExited = false;

		return new Promise((resolve, reject) => {
			(function watchExit(agent) {
				agent.master.nextTick(() => {
					const { program } = agent.$windowModel;
					const { isExited, returnValue, error } = program;
		
					if (!isExited) {
						return watchExit(agent);
					}

					if (program.hash !== hash) {
						return reject(new Error(`Program(${hash}) has been destroy`));
					}

					if (error) {
						return reject(new Error(error.message));
					}

					return resolve(returnValue);
				});
			}(this));
		});
	}
};