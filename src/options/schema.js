const _ = require('lodash');
const path = require('path');

module.exports = {
	agents(value) {
		if (!_.isArray(value)) {
			return false;
		}

		return !value.find(name => !_.isString(name));
	},
	polling: _.isNumber,
	assert: {
		timeout: _.isNumber
	},
	program: {
		timeout: _.isNumber,
		polling: _.isNumber,
		idle: _.isNumber
	},
	idle: {
		timeout: _.isNumber
	},
	log: {
		path: path.isAbsolute,
		saving: _.isBoolean
	}
};