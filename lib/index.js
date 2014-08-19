'use strict';

let	Bromise = require('bluebird'),
		config = require('./config/config'),
		Matcher = require('./models/matcher'),
		Entry = require('./models/entry-redis'),
		connectionDetails = require('amqp-connect')(config.amqp);


/** 
 * Recover from failure and start matching
*/
let matcher;
Entry.findAll().then(function(entries) {
	matcher = new Matcher.Matcher(entries);
	matcher.on('match', matchFound);
	matcher.start();

	connectionDetails.defaultChannel.consume(config.amqp.endpoints.joinPlayerPool.queueName, joinPlayerPool);
	connectionDetails.defaultChannel.consume(config.amqp.endpoints.leavePlayerPool.queueName, leavePlayerPool);
});

/**
 * Receives messages from RabbitMQ and adds the player to the playerpool
 * @param {object} message - Contains information about the player
 */
function joinPlayerPool(message) {
	let user = JSON.parse(message.content.toString()),
	  	entry = new Entry.Entry({ playerid: user.id, playerstrength: user.strength });

	matcher.addEntry(entry).then(function() {
		connectionDetails.defaultChannel.ack(message);
	});	
}

/**
 * Receives messages from RabbitMQ and removes the player from the playerpool
 * @param {object} message - Contains information about the player
 */
function leavePlayerPool(message) {
	let user = JSON.parse(message.content.toString());

	matcher.removePlayer(user.id).then(function() {
		connectionDetails.defaultChannel.ack(message);
	});	
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


