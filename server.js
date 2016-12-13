var express = require('express'),
	app = express(),
	path = require('path'),
	index = require('./routes/index');
	
global.keys = {
	private: path.join(__dirname, 'keys', 'afip.key'),
	public: path.join(__dirname, 'keys', 'afip.pem')
};

// Start Routes
index(app);

app.listen(process.env.PORT || 3000, function () {
  console.log('AFIP API Corriendo en el puerto ' + ( process.env.PORT || 3000 ));
});
