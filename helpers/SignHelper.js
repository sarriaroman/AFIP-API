var util = require('util'),
	spawn = require('child_process').spawn;

// Expose methods.
exports.sign = sign;

/**
 * Sign a file.
 *
 * @param {object} options Options
 * @param {string} options.key Key path
 * @param {string} options.cert Cert path
 * @param {string} [options.password] Key password
 * @returns {Promise} result Result
 */

function sign(options) {
	return new Promise(function (resolve, reject) {
		options = options || {};

		if (!options.content)
			reject('Invalid content.');

		if (!options.key)
			reject('Invalid key.');

		if (!options.cert)
			reject('Invalid certificate.');

		var command = util.format(
			'openssl smime -sign -signer %s -inkey %s -outform DER -nodetach',
			options.cert,
			options.key
		);

		if (options.password)
			command += util.format(' -passin pass:%s', options.password);

		var args = command.split(' ');
		var child = spawn(args[0], args.splice(1), { encoding: 'base64' });

		var der = [];

		child.stdout.on('data', function (chunk) {
			der.push(chunk);
		});

		child.on('close', function (code) {
			if (code !== 0) {
				reject(new Error('Process failed.'));
			} else {
				resolve(Buffer.concat(der).toString('base64'));
			}
		});

		child.stdin.write(options.content); //.replace(/["']/g, '\\"')
		child.stdin.end();
	});
}
