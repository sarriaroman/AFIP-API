// Going Serverless :)
const serverless = require('serverless-http'),
	restana = require('restana')

// creating service
const app = restana();

// Start Routes
index(app, true);

// lambda integration
const handler = serverless(app);

// Export the handler
module.exports.handler = async (event, context) => {
	return await handler(event, context)
};
