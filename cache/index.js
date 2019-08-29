const fs = require('fs'),
	path = require('path');

class Cache {
	constructor(name) {
		this.storePath = path.join('.', 'cache', `${name}`);
	}

	getItem(key) {
		let obj = fs.readFileSync(this.storePath, 'utf8');

		if (obj && obj != '') {
			return JSON.parse(obj);
		}

		return false;
	}

	setItem(key, value) {
		if (value) {
			return fs.writeFileSync(this.storePath, JSON.stringify(value));
		}

		return false;
	}

	clear() {
		return fs.unlink(this.storePath);
	}
}

module.exports = Cache;
