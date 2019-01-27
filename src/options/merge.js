const path = require('path');
const schema = require('./schema');
const validate = require('./validate');

module.exports = function mergeOptions(...optionsList) {
	const final = DefaultMasterOptionsFactory();

	optionsList.forEach(options => {
		const {
			observerUrl = final.observerUrl,
			agents = final.agents,
			polling = final.polling,

			assert, program, idle, log
		} = options;

		final.observerUrl = observerUrl;
		final.agents = agents;
		final.polling = polling;

		if (assert) {
			const {
				timeout = final.assert.timeout
			} = assert;

			final.assert.timeout = timeout;
		}

		if (program) {
			const {
				timeout = final.program.timeout,
				polling = final.program.polling,
				idle = final.program.idle
			} = program;

			final.program.timeout = timeout;
			final.program.polling = polling;
			final.program.idle = idle;
		}
		
		if (idle) {
			const {
				timeout = final.idle.timeout
			} = idle;

			final.idle.timeout = timeout;
		}

		if (log) {
			const {
				path = final.log.path,
				saving = final.log.saving
			} = log;

			final.log.path = path;
			final.log.saving = saving;
		}
	});

	validate(final, schema);
};

function DefaultMasterOptionsFactory() {
	return {
		// observerUrl: '',
		agents: ['main'],
		polling: 33,
		assert: {
			timeout: 5000
		},
		program: {
			timeout: 10000,
			polling: 33,
			afterIdle: 500,
		},
		idle: {
			timeout: 2000
		},
		log: {
			path: path.resolve('./logs'),
			saving: false
		}
	};
}
