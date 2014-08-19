'use strict';

let _ = require('lodash');

module.exports = _.merge(
	require('./env/common'),
	require('./env/' + (process.env.NODE_ENV || 'development') + '.js')
);