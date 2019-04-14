const path = require('path');
global.config = require(path.resolve('config.json'));

exports.Master = require('./src/master');
exports.utils = require('./src/uitls');