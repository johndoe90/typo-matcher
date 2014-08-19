'use strict';

let util = require('util'),
		winston = require('winston'),
		config = require('./config').winston,
		winstonRabbitmq = require('winston-rabbitmq');

winston.add(winston.transports.RabbitLogger, config);
