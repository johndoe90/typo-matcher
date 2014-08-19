'use strict';

	/**
	 * Global configuration 
	*/
module.exports = {

	/**
	 * Configuration for the Matcher
	*/
	matcher: {
		matchWindow: 25,
		matchInterval: 2500
	},

	/**
	 * Configuration for the AMQP Connection
	*/
	amqp: {
		port: 5672,
		virtualHost: '',
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

	/**
	 * Configuration for the Redis Connection
	*/
	redis: {
		port: 6379,
		database: 0,
		host: 'localhost',
		options: {}
	},

	/**
	 * Configuration for the Winston RabbitMQ Logger
	*/
	winston: {
		handleExceptions: true
	},


	/*postgres: {
		port: 5432,
		table: 'entries',
		host: 'localhost',
		database: 'matcher',
		username: process.env.POSTGRES_USERNAME || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres'
	}*/
};
