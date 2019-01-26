const path = require('path');


function MasterOptionsFactory() {
	return {
		observerUrl: '',
		agents: ['main'],
		polling: 300,
		assert: {
			timeout: 5000
		},
		rpc: {
			timeout: 3000,
			polling: 20,
			idle: 0,
		},
		idle: {
			timeout: 2000
		},
		log: {
			path: path.resolve(),
			saving: false
		}
	};
}
