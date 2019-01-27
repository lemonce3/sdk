exports.provideIdle = function provideIdle(defaultTimeout) {
	return async function idle(time = defaultTimeout) {
		if (typeof time !== 'number' || time < 0) {
			throw new Error('A valid time value excepted, number & greater than 0ms.');
		}

		return new Promise(resolve => setTimeout(() => resolve(), time));
	};
};

exports.provideAssert = function provideAssert(defaultLimit) {
	return async function assert(expression, limit = defaultLimit) {
		const timoutTime = Date.now() + limit;

		if (typeof expression !== 'function') {
			throw new Error('Assertion expression must be a function.');
		}
		
		return new Promise((resolve, reject) => {
			(async function expressionWatcher() {
				if (Date.now() > timoutTime) {
					return reject(new Error('Assertion failed.'));
				}

				try {
					if (await expression()) {
						return resolve();
					}
				} finally {
					setTimeout(() => expressionWatcher(), 50);
				}
			}());
		});
	};
};