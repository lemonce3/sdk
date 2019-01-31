const _ = require('lodash');

exports.provideIdle = function provideIdle(defaultTimeout) {
	return async function idle(time = defaultTimeout) {
		if (typeof time !== 'number' || time < 0) {
			throw new Error('A valid time value excepted, number & greater than 0ms.');
		}

		return new Promise(resolve => setTimeout(() => resolve(), time));
	};
};

exports.provideAssert = function provideAssert(defaultTimeout, polling) {
	return async function assert(expression, timeout = defaultTimeout) {
		if (!_.isFunction(expression)) {
			throw new Error('Assertion expression must be a function.');
		}

		if (!_.isNumber(timeout) || timeout <= 0) {
			throw new Error('Assertion timeout must be a number.');
		}

		const timeoutTime = Date.now() + timeout;
		
		return new Promise((resolve, reject) => {
			(async function expressionWatcher() {
				if (Date.now() > timeoutTime) {
					return reject(new Error('Assertion failed.'));
				}

				const result = await expression();

				if (result) {
					return resolve(result);
				} else {
					setTimeout(() => expressionWatcher(), polling);
				}
			}());
		});
	};
};