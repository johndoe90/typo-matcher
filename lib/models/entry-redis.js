'use strict';

let util = require('util'),
		UUID = require('node-uuid'),
		Bromise = require('bluebird'),
		client = require('./../config/redis').client;

/**
 * Constructor for the Entry
 * An entry has a priority and player-information, which is used to match entries.
 * @param {Object} data - Data required to create the entry.
 * @constructor
*/
let Entry = function(data) {
	this.id = data.id;
	this.priority = data.priority || 1;
	this.player = {
		id: data.playerid,
		strength: data.playerstrength
	};
};

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
 * Find one entry by its id/key.
 * @param {String} id
 * @returns {Object} - The requested entry or undefined.
*/
let findById = exports.findById = function(id) {
	return client.hgetallAsync(id).then(function(entry) {
		if ( entry ) {
			entry.id = id;
			return new Entry(entry);
		}
	});
};

/**
 * Prioritize one entry with the given id/key.
 * @param {String} id
*/
let prioritize = exports.prioritize = function(id) {
	return findById(id).then(function(entry) {
		if ( entry ) {
			return client.hsetAsync(entry.id, 'priority', Number(entry.priority) + 1);
		}
	});
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
				multi.hgetall(id);
			});

			return multi.execAsync();
		}
	}).then(function(results) {
		if ( results ) {
			for ( let i = 0; i < results.length; i++ ) {
				if ( results[i] ) {
					results[i].id = ids[i];
					allEntries.push(new Entry(results[i]));
				} else {
					client.sremAsync('entries', ids[i]);
				}
			}
		}

		return allEntries;
	});
};

/**
 * Save the given entry to the database.
 * @param {Object} entry - The entry to save.
 * @returns {Object} - The saved entry.
*/
let save = exports.save = function(entry) {
	let id = 'entry:' + UUID.v4(),
			multi = getMulti();
	
	multi.sadd('entries', id);
	multi.hmset(id, {
		priority: entry.priority,
		playerid: entry.player.id,
		playerstrength: entry.player.strength
	});
	
	return multi.execAsync().then(function() {
		return findById(id);
	});
};

/**
 * Remove the entry with the given id/key.
 * @param {String} id
*/
let remove = exports.delete = function(id) {
	let multi = getMulti();
	multi.srem('entries', id);
	multi.del(id);

	return multi.execAsync();
};

/**
 * Expose the Entry
*/
exports.Entry = Entry;
