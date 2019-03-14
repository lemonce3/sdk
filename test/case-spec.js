const { Master } = require('../');

Master.create(agentList => {
	return {
		main: agentList[0].id
	};
});

describe('demo', function () {
	it('debug', function () {
		console.log(master)

	});
});