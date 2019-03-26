exports.wait = function wait(timeout) {
	console.log('=' + timeout)
	return new Promise(resolve => setTimeout(() => resolve(), timeout));
};