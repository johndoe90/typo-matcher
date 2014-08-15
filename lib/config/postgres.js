'use strict';

let client,
		pg = require('pg'),
		util = require('util'),
		Promise = require('bluebird'),
		config = require('./config').postgres;

function assemblePostgresUrl(config) {
	return util.format('postgres://%s:%s@%s:%d/%s', 
		config.username, 
		config.password, 
		config.host, 
		config.port, 
		config.database);
}

function tearDownPostgresConnection() {
	console.log('teeeee');
	client.end();
}

function postgresConnection() {
	if ( !postgresConnection.isSetUp ) {
		client = new pg.Client(assemblePostgresUrl(config));
		client = Promise.promisifyAll(client);
		postgresConnection.isSetUp = client.connectAsync().then(function() {
			process.once('SIGINT', tearDownPostgresConnection);
			return client;
		});
	}

	return postgresConnection.isSetUp;
}

module.exports = postgresConnection();

