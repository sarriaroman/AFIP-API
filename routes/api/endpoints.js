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

	endpoint(req, res) {
		var service = req.params.service;
		var endpoint = req.params.endpoint;

		WSAA.generateToken(service).then((tokens) => {

			this.createClientForService(service).then((client) => {
				var params = { ...req.body.params };
				console.info(req.body);

				params[`${req.body.auth.key}`] = {
					//Token: tokens.token,
					//Sign: tokens.sign
				};

				params[`${req.body.auth.key}`][`${req.body.auth.token}`] = tokens.token;
				params[`${req.body.auth.key}`][`${req.body.auth.sign}`] = tokens.sign;

				console.info(params);

				client[endpoint](params, (err, result) => {
					try {
						res.send(result[`${endpoint}Result`]);
					} catch (e) {
						res.send(result);
					}
				});
			}).catch(err => {
				console.info(err);
				res.send({ result: false });
			});

		}).catch((err) => {
			res.send({
				result: false,
				err: err.message
			});
		});
	}

	describe(req, res) {
		var service = req.params.service;

		WSAA.generateToken(service).then((tokens) => {

			this.createClientForService(service).then((client) => {
				res.send(client.describe());
			});

		}).catch((err) => {
			res.send({
				result: false,
				err: err.message
			});
		});
	}

}

module.exports = Endpoints;
