const axios = require('axios');

const cookieStringReg = /LC_AGENT=([a-z0-9]{40})/;
const agentAxios = axios.create({
	baseURL: 'http://127.0.0.1:8080/api',
});

module.exports = async () => {
	const { headers } = await agentAxios.get('/agent/fetch');
	const agentId = headers['set-cookie'][0].match(cookieStringReg)[1];
	
	const timer = setInterval(() => {
		agentAxios.get('/agent/fetch', {
			headers: { cookie: `LC_AGENT=${agentId}` }
		});
	}, 2000);

	return function () {
		clearInterval(timer);
	};
};