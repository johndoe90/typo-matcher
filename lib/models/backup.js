'use strict';

let util = require('util'),
	Bromise = require('bluebird'),
	client = require('./../config/redis').client;

/** 
 * Helperfunction
 * @returns {Object} - redis multi instance
*/
let getMulti = function() {
	let multi = client.multi();
	multi.execAsync = Bromise.promisify(multi.exec);

	return multi;
};

/**
 * Save the given entry to the database.
 * @param {string} id - The entry to save.
 * @param {object} data
*/
let add = exports.save = function(id, data) {
	client.sadd('entries', id);
	client.set(id, data);
};

/**
 * Remove the entry with the given id/key.
 * @param {string} id
*/
let remove = exports.delete = function(id) {
	client.srem('entries', id);
	client.del(id);
};

/** 
 * Find all entries in the database.
 * @returns {Array}
*/
let findAll = exports.findAll = function() {
	let	ids, 
		allEntries = [],
		multi = getMulti();
	
	return client.smembersAsync('entries').then(function(results) {
		if ( results ) {
			ids = results;
			ids.forEach(function(id) {
				multi.get(id);
			});

			return multi.execAsync();
		}
	}).then(function(results) {
		if ( results ) {
			for ( let i = 0; i < results.length; i++ ) {
				if ( results[i] ) {
					allEntries.push(results[i]);
				} else {
					client.sremAsync('entries', ids[i]);
				}
			}
		}

		return allEntries;
	});
};