module.exports = class Upload {
	constructor(agent) {
		this.agent = agent;
	}

	open(fileList) {
		const windowModel = this.agent.$windowModel;
		
		if (windowModel.upload.pendding === true) {
			return windowModel.upload.fileList = fileList;
		}
	}
}