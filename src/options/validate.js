module.exports = function validateOptions(options, schema) {
	const nodePath = [];

	function validate(ruleNode, optionsNode) {
		Object.keys(ruleNode).forEach(item => {
			nodePath.push(item);

			const ruleValidator = ruleNode[item];
			const optionsValue = optionsNode[item];

			if (typeof ruleValidator === 'object') {
				validate(ruleValidator, optionsValue);
			} else if (!ruleValidator(optionsValue, options)) {
				throw new Error(`Bad value at options.${nodePath.join('.')}`);
			}

			nodePath.pop();
		});
	}

	validate(schema, options);

	return true;
};