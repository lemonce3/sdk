exports.wait = function wait(timeout) {
	new Promise(resolve => setTimeout(() => resolve(), timeout));
};