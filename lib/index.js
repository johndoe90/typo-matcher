'use strict';

let	client, channel, matcher,
		Promise = require('bluebird'),
		amqp = require('./config/amqp'),
		Entry = require('./models/entry'),
		config = require('./config/config'),
		Matcher = require('./models/matcher'),
		postgres = require('./config/postgres');

function appReady() {
	return Promise.all([postgres, amqp]).then(function(result) {
		client = result[0];
		channel = result[1];
	});
}

function incoming(message) {
	let user = JSON.parse(message.content.toString()),
	  	entry = new Entry.Entry({ playerid: user.id, playerstrength: user.strength });

	matcher.addEntry(entry).then(function() {
		channel.ack(message);
	});
}

function outgoing(match) {
	/*channel.publish(config.amqp.publisher.exchange, 
									config.amqp.publisher.routingPattern, 
									new Buffer(JSON.stringify(match)),
									{ contentType: 'application/json' });*/
	console.log('matched ' + match);
}

let test;
appReady().then(function() {
	return Entry.findAll();
}).then(function(entries) {
	matcher = new Matcher.Matcher(entries);
	matcher.on('match', outgoing);
	matcher.start();

	test = setInterval(function() {

		let entry = new Entry.Entry({
			playerid: '' + (Math.floor(Math.random() * 1000000) + 1),
			playerstrength: Math.floor(Math.random() * 2400) + 400
		});

		matcher.addEntry(entry);
	}, 50);

	process.on('SIGINT', function() {
		clearInterval(test);
	});

	channel.consume(config.amqp.consumer.queue, incoming);
});



