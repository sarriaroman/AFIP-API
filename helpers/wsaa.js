const fs = require('fs'),
	soap = require('soap'),
	moment = require('moment'),
	xml2js = require('xml2js'),
	parseString = xml2js.parseString,
	ntpClient = require('ntp-client'),
	SignHelper = require('./SignHelper'),
	AfipURLs = require('./urls'),
	Cache = require('../cache');

class Tokens {
	constructor() {
		this.privateKey = fs.readFileSync(global.keys.private, 'utf8');
		this.publicKey = fs.readFileSync(global.keys.public, 'utf8');

		this.client = false;

		this.cache = new Cache('tokens');
	}

	createClient() {
		return new Promise((resolve, reject) => {
			if (this.client) {
				resolve(this.client);
			} else {
				soap.createClient(AfipURLs.getWSAA(), (err, client) => {
					if (err && !client) {
						reject();
					} else {
						this.client = client;

						resolve(this.client);
					}

				});
			}
		});
	}

	isExpired(service) {
		try {
			const cachedService = this.cache.getItem(service);
			if (cachedService && cachedService.date) {
				var hours = Math.abs((new Date()) - cachedService.date) / 36e5;

				return (hours > 12);
			} else {
				return true;
			}
		} catch (e) {
			return true;
		}
	}

	getCurrentTime() {
		return new Promise((resolve, reject) => {
			ntpClient.getNetworkTime("time.afip.gov.ar", 123, function (err, date) {
				if (err) {
					reject(err);
				} else {
					console.log("Current time: ", date);
					resolve(date);
				}
			});
		});
	}

	openssl_pkcs7_sign(data, callback) {
		SignHelper.sign({
			content: data,
			key: global.keys.private,
			cert: global.keys.public
		}).catch(function (err) {
			callback(err);
		}).then(function (result) {
			callback(null, result);
		});
	}

	encryptXML(xml) {
		return new Promise((resolve) => {
			this.openssl_pkcs7_sign(xml, (err, enc) => {
				resolve(enc);
			});
		});
	}

	parseXML(data) {
		return new Promise((resolve, reject) => {
			parseString(data, {
				normalizeTags: true,
				normalize: true,
				explicitArray: false,
				attrkey: 'header',
				tagNameProcessors: [(key) => { return key.replace('soapenv:', ''); }]
			}, (err, res) => {
				if (err) reject(err);
				else resolve(res);
			});
		});
	}

	formatDate(date) {
		return moment(date).format().replace('-03:00', '');
	}

	generateCMS(service) {
		return new Promise((resolve, reject) => {
			this.getCurrentTime().then((date) => {
				var tomorrow = new Date();

				// add a day
				tomorrow.setDate(date.getDate() + 1);

				tomorrow.setMinutes(date.getMinutes());

				var xml = `<?xml version="1.0" encoding="UTF-8" ?><loginTicketRequest version="1.0"><header><uniqueId>{uniqueId}</uniqueId><generationTime>{generationTime}</generationTime><expirationTime>{expirationTime}</expirationTime></header><service>{service}</service></loginTicketRequest>`;

				xml = xml.replace('{uniqueId}', moment().format('X'));
				xml = xml.replace('{generationTime}', this.formatDate(date));
				xml = xml.replace('{expirationTime}', this.formatDate(tomorrow));
				xml = xml.replace('{service}', service);

				xml = xml.trim();

				this.encryptXML(xml).then(resolve).catch(reject);
			});
		});
	}

	generateToken(service, refresh = false) {
		// Parse some of the Services
		if (service == 'wsfev1') {
			service = 'wsfe';
		}

		return new Promise((resolve, reject) => {

			if (this.isExpired(service) || refresh === true) {

				this.createClient().then((client) => {

					this.generateCMS(service).then((data) => {
						client.loginCms({
							in0: data
						}, (err, result, raw, soapHeader) => {
							this.parseXML(raw).then((res) => {
								//console.info(res.envelope.body);
								var xml_response = res.envelope.body.logincmsresponse.logincmsreturn;

								if (xml_response) {
									this.parseXML(xml_response).then((res) => {
										//console.info(res.loginticketresponse.header);
										var credentials = res.loginticketresponse.credentials;

										this.cache.setItem(service, {
											date: new Date(),
											credentials: credentials
										});

										resolve(credentials);
									}).catch(reject);
								} else {
									reject(res.envelope.body.fault);
								}
							}).catch(reject);
						});
					});

				});

			} else {
				resolve(this.cache.getItem(service).credentials);
			}

		});
	}
}

module.exports = new Tokens();
