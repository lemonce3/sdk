function Driver() {}

Driver.prototype.getTitle = async function () {
	return await this.execute('test.getTitle', []);
};

module.exports = {
	Driver
};