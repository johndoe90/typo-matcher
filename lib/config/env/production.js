'use strict';

let util = require('util');

let config = module.exports = {
	/**
	 * Configuration for the Matcher
	*/
	matcher: {
		matchWindow: 25,
		matchInterval: 2500
	},

	/**
	 * Configuration for the Winston RabbitMQ Logger
	*/
	winston: {
		handleExceptions: true,
		applicationId: 'typo-matcher'
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
	 * Configuration for the AMQP Connection
	*/
	amqp: {
		/**
		 * AMQP Server
		*/
		server: {
			port: 5672,
			virtualHost: '',
			host: 'localhost',
			username: process.env.AMQP_USERNAME,
			password: process.env.AMQP_PASSWORD
		},

		/**
		 * Required Queues, Exchanges, etc.
		*/
		endpoints: {
			joinPlayerPool: {
				queueName: 'joinPlayerPool',
				exchangeName: 'typo.matcher',
				exchangeType: 'topic',
				routingPattern: 'join'
			},

			leavePlayerPool: {
				queueName: 'leavePlayerPool',
				exchangeName: 'typo.matcher',
				exchangeType: 'topic',
				routingPattern: 'leave'
			},

			matchFound: {
				exchangeName: 'typo.matcher.matches',
				exchangeType: 'topic',
				routingPattern: 'match'
			}
		}
	}
};

/**
 * Use the same amqp connection settings for winston rabbitmq logger
*/
util._extend(config.winston, config.amqp.server);