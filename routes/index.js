var _ = require('lodash'),
	cors = require('cors');

// Setup Route Bindings
exports = module.exports = function (app) {
	app.use(cors());

	app.get('/', function (req, res) {
		res.end('Nada Aquí');
	});

	// API
	var Endpoint = require('./api/endpoints');
	new Endpoint(app);
};
