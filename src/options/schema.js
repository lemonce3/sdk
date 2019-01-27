const _ = require('lodash');
const path = require('path');

module.exports = {
	observerUrl: isURL,
	agents(value) {
		if (!_.isArray(value)) {
			return false;
		}

		return !value.find(name => !_.isString(name));
	},
	polling: _.isNumber,
	assert: {
		timout: _.isNumber
	},
	program: {
		timout: _.isNumber,
		polling: _.isNumber,
		idle: _.isNumber
	},
	idle: {
		timout: _.isNumber
	},
	log: {
		path: path.isAbsolute,
		saving: _.isBoolean
	}
};

function isURL(value) {
	try {
		new URL(value);

		return true;
	} catch (err) {
		return false;
	}
}