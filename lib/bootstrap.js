'use strict';

let	Bromise = require('bluebird'),
		amqp = require('./config/amqp'),
		redis = require('./config/redis'),
		//winston = require('./config/winston'),
		initializer = require('application-initializer');

initializer.initialize().then(function() {
	require('./index');
}, function(err) {
	console.log('An error occured: ' + err);
	process.exit();
});