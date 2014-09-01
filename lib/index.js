'use strict';

let	winston = require('winston'),
	backup = require('./models/backup'),
	config = require('./config/config'),
	Matcher = require('./models/matcher'),
	connectionDetails = require('amqp-connect')(config.amqp);

/**
 * Recover from failure and start
*/
let matcher;
backup.findAll().then(function(data) {
	data = data.map(function(current) {
		try {
			return JSON.parse(current, revive);
		} catch (err) {
			winston.error('Found an invalid entry in the database');
		}
	}).filter(function(current) {
		return isValid(current);
	});

	matcher = new Matcher(data);
	matcher.on('match', matchFound);
	matcher.start();

	connectionDetails.defaultChannel.consume(config.amqp.endpoints.joinPlayerPool.queueName, joinPlayerPool);
	connectionDetails.defaultChannel.consume(config.amqp.endpoints.leavePlayerPool.queueName, leavePlayerPool);
});

/**
 * Restore an entry from JSON
*/
function revive(key, value) {
	if ( key === '_test' ) {
		/* jshint ignore:start */
		this.test = new Function(value);
		/* jshint ignore:end */
	}

	return value;
}


/** 
 * Sends message to RabbitMQ 
 * @param {object} match - Contains information about the matched players
 */
function matchFound(match) {
	connectionDetails.defaultChannel.publish(
		config.amqp.endpoints.matchFound.exchangeName, 
		config.amqp.endpoints.matchFound.routingPattern, 
		new Buffer(JSON.stringify(match)),
		{ contentEncoding: 'utf8', contentType: 'application/json' }
	);
}

/**
 * Receives messages from RabbitMQ and removes the player from the playerpool
 * @param {object} message - Contains information about the player
 */
function leavePlayerPool(message) {
	matcher.remove(message.content.toString());
	connectionDetails.defaultChannel.ack(message);
}

/**
 * Receives messages from RabbitMQ and adds the player to the playerpool
 * @param {object} message - Contains information about the player
 */
function joinPlayerPool(message) {
	try {
		let entry = JSON.parse(message.content.toString(), revive);

		if ( !isValid(entry) ) { throw new Error('Invalid Message'); }

		matcher.add(entry);
	} catch (err) {
		winston.error('Received an invalid message');
	} finally {
		connectionDetails.defaultChannel.ack(message);
	}
}

/**
 * Validates if it is a valid entry
*/
function isValid(entry) {
	if ( !entry ) { return false; }
	if ( !entry.id || typeof entry.id !== 'string' ) { return false; }
	if ( !entry.date || typeof entry.date !== 'number' ) { return false; }
	if ( !entry.criteria || typeof entry.criteria !== 'object' ) { return false; }
	
	for ( var key in entry.criteria ) {
		if ( entry.criteria.hasOwnProperty(key) ) {
			if ( !entry[key] ) { return false; }
		}
	}

	return true;
}