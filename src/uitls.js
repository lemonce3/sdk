exports.wait = function wait(timeout) {
	return new Promise(resolve => setTimeout(() => resolve(), timeout));
};