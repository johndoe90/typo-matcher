'use strict';

let util = require('util'),
		config = require('./config'),
		Bromise = require('bluebird'),
		initializer = require('application-initializer'),
		connectionDetails = require('amqp-connect')(config.amqp.server);

let joinPlayerPool = function(options) {
	return Bromise.join(
		connectionDetails.defaultChannel.assertQueue(options.queueName, {durable: true}),
		connectionDetails.defaultChannel.assertExchange(options.exchangeName, options.exchangeType, {durable: true}),
		connectionDetails.defaultChannel.bindQueue(options.queueName, options.exchangeName, options.routingPattern)
	);
};

let leavePlayerPool = function(options) {
	return Bromise.join(
		connectionDetails.defaultChannel.assertQueue(options.queueName, {durable: true}),
		connectionDetails.defaultChannel.assertExchange(options.exchangeName, options.exchangeType, {durable: true}),
		connectionDetails.defaultChannel.bindQueue(options.queueName, options.exchangeName, options.routingPattern)
	);
};

let matchFound = function(options) {
	return connectionDetails.defaultChannel.assertExchange(options.exchangeName, options.exchangeType, {durable: true});
};

let setup = connectionDetails.ready.then(function() {
	return Bromise.join(
		joinPlayerPool(config.amqp.endpoints.joinPlayerPool),
		leavePlayerPool(config.amqp.endpoints.leavePlayerPool),
		matchFound(config.amqp.endpoints.matchFound)
	);
});

initializer.addDependency('Setup AMQP endpoints', setup);