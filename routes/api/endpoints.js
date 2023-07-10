const soap = require('soap'),
	WSAA = require('../../helpers/wsaa'),
	AfipURLs = require('../../helpers/urls');

class Endpoints {

	constructor(app) {
		app.get('/api/:service/describe', this.describe.bind(this));

		app.post('/api/:service/refresh/token', this.recreate_token.bind(this));

		app.post('/api/:service/:endpoint', this.endpoint.bind(this));

		this.clients = {};
	}

	createClientForService(service) {
		return new Promise((resolve, reject) => {
			if (this.clients[service]) {
				resolve(this.clients[service]);
			} else {
				soap.createClient(AfipURLs.getService(service), (err, client) => {
					if (err && !client) {
						reject(err);
					} else {
						this.clients[service] = client;

						resolve(client);
					}
				});
			}
		});
	}

	recreate_token(req, res) {
		var service = req.params.service;

		WSAA.generateToken(service)
			.then((tokens) => res.send(tokens))
			.catch((err) => {
				res.send({
					result: false,
					err: err.message
				});
			});
	}

	async endpoint(req, res) {
		var service = req.params.service;
		var endpoint = req.params.endpoint;

		const tokens = await WSAA.generateToken(service).catch((err) => {
			res.send({
				result: false,
				err: err.message
			});
			throw err
		});

		const client = await this.createClientForService(service).catch(err => {
			console.error(err);
			res.send({ result: false });
			throw err;
		});

		var params = { ...req.body.params };
		console.info(req.body);

		if (params[`${req.body.auth.key}`] === undefined)
			params[`${req.body.auth.key}`] = {};

		params[`${req.body.auth.key}`][`${req.body.auth.token}`] = tokens.token;
		params[`${req.body.auth.key}`][`${req.body.auth.sign}`] = tokens.sign;

		console.info(params);

		client[endpoint](params, (err, result) => {
			try {
				res.send(result[`${endpoint}Result`]);
			} catch (e) {
				res.send(result);
				throw e;
			}
		});


	}

	async describe(req, res) {
		var service = req.params.service;

		const client = await this.createClientForService(service);

		res.send(client.describe());


	}

}

module.exports = Endpoints;
