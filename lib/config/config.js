'use strict';

module.exports = {
	matchWindow: 25,
	matchInterval: 2500,

	amqp: {
		vhost: '',
		port: 5672,
		host: 'localhost',
		username: process.env.AMQP_USERNAME || 'guest',
		password: process.env.AMQP_PASSWORD || 'guest',

		consumer: {
			queue: 'matcher',
			exchange: 'amq.topic',
			exchangeType: 'topic',
			routingPattern: 'matcher'
		},

		publisher: {
			exchange: 'amq.topic',
			exchangeType: 'topic',
			routingPattern: 'match'
		}
	},

	postgres: {
		port: 5432,
		table: 'entries',
		host: 'localhost',
		database: 'matcher',
		username: process.env.POSTGRES_USERNAME || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres'
	}
};