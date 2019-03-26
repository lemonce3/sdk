const { utils } = require('../');
const Native = require('../interface/native');
const Player = require('../interface/player');
const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

describe.only('Interface::Player', function () {
	describe('All in', function () {
		it('should NO thorws.', async function () {
			const img = fs.readFileSync(path.join(__dirname, 'assets/img.jpeg'));
	
			await Player.play(master.agent('main'))
				.goto('/?test=123')
				.wait(2000)
				.back()
				.wait(2000)
				.forward()
				.wait(2000)
				.refresh()
				.wait(2000)
				.dblclick(['body'])
				.contextmenu(['body'])
				.check(['#checkbox-unchecked'])
				.uncheck(['#checkbox-checked'])
				.select(['select'], 1)
				.input(['[type=text]'], 'hello, lemonce')
				.scroll(['*', '*', '*', 'frame', 'a'])
				.click(['[type=file]'])
				.upload([
					{ name: '验证码.jpeg', type: 'image/jpeg', blob: img }
				])
				.end();
		});
	});
});