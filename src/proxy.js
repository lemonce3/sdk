class AgentObject {

}

class AgentObjectFunction extends AgentObject {

}

class AgentObjectArray extends AgentObject {

}

function AgentObjectProxy() {
	return new Proxy({}, {
		async get() {
			new Proxy();
		}
	});
}

function AgentObjectMethodProxy() {
	
}