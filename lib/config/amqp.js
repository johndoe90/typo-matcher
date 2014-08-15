'use strict';

let	channel,
		connection,
		util = require('util'), 
		amqp = require('amqplib'),
		Promise = require('bluebird'),
		config = require('./config').amqp;

function buildAmqpUrl() {
	return util.format('amqp://%s:%s@%s:%d%s',
			config.username,
			config.password,
			config.host,
			config.port,
			config.vhost);
}

function amqpConnection() {
	if ( !amqpConnection.isSetUp ) {
		amqpConnection.isSetUp = amqp.connect(buildAmqpUrl()).then(function(con) {
			connection = con;
			return connection.createChannel();
		}).then(function(ch) {
			channel = ch;
			process.once('SIGINT', tearDownAmqpConnection);
			return Promise.all([
				channel.assertQueue(config.consumer.queue, {durable: true}),
				channel.assertExchange(config.consumer.exchange, config.consumer.exchangeType, {durable: true}),
				channel.bindQueue(config.consumer.queue, config.consumer.exchange, config.consumer.routingPattern),
				channel.assertExchange(config.publisher.exchange, config.publisher.exchangeType, {durable: true})			
			]);
		}).then(function() {
			return channel;
		});
	}

	return amqpConnection.isSetUp;
}

function tearDownAmqpConnection() {
	channel.close().finally(function() {
		connection.close();
	});
}

module.exports = amqpConnection();