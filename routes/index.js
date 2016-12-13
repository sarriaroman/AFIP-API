var _ = require('lodash'),
	cors = require('cors'),
	bodyParser = require('body-parser');

// Setup Route Bindings
exports = module.exports = function (app) {
	app.use(cors());

	// Add Middlewares
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.get('/', function (req, res) {
		res.end('Nada Aquí');
	});

	// API
	var Endpoint = require('./api/endpoints');
	new Endpoint(app);
};
