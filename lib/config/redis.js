'use strict';

let redis = require('redis'),
		Bromise = require('bluebird'),
		config = require('./config').redis,
		initializer = require('application-initializer');

let deferred = Bromise.defer();
let client = Bromise.promisifyAll(redis.createClient(config.port, config.host, config.options));
	
client.on('ready', function() {
	client.selectAsync(config.database).then(function() {	
		deferred.resolve('redis is ready');
	});
});

client.on('error', function(err) {
	deferred.reject(err);
});

process.once('SIGINT', function() {
	client.quit();
});

initializer.addDependency('Redis Connection Setup', deferred.promise);

exports.client = client;


