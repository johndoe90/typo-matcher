'use strict';

let util = require('util'),
		logger = require('winston'),
		Bromise = require('bluebird'),
		Entry = require('./entry-redis'),
		EventEmitter = require('events').EventEmitter,
		config = require('./../config/config').matcher;

/**
 * Constructor for Matcher
 * A Matcher is responsible for handling the playerpool-entries and matching them
 * against each other. If a match is found, the entries will be removed from the pool
 * and the "match" event will be fired.
 * @param {Array} entries - Entries to start of with.
 * @constructor
*/
let Matcher = function(entries) {
	this.entries = entries || [];
};

/**
 * Inherit from EventEmitter to emit "match" event
*/
util.inherits(Matcher, EventEmitter);

/**
 * Returns the index of the given entry.
 * @param {Object} entry - The entry to look for.
 * @returns {Number} - If the entry is not found -1 is returned.
*/
Matcher.prototype.indexOf = function(entry) {
	for (let i = 0; i < this.entries.length; i++) {
		if ( this.entries[i].id === entry.id ) {
			return i;
		}
	}

	return -1;
};

Matcher.prototype.removePlayer = function(playerId) {
	for ( let i = 0; i < this.entries.length; i++ ) {
		if ( this.entries[i].player.id === playerId ) {
			return this.removeEntry(this.entries[i]);
		}
	}

	let deferred = Bromise.defer();
	deferred.resolve();

	return deferred.promise;
};

/**
 * Add an entry to the pool.
 * @param {Object} entry - The entry to add.
*/
Matcher.prototype.addEntry = function(entry) {
	let self = this;	
	return Entry.save(entry).then(function(entry) {
		self.entries.push(entry);
	});
};

/**
 * Remove and entry from the pool.
 * @param {Object} entry - The entry to remove.
*/
Matcher.prototype.removeEntry = function(entry) {
	let index = this.indexOf(entry);
	if ( index !== -1 ) {
		this.entries.splice(index, 1);
	}

	return Entry.delete(entry.id);
};

/**
 * Prioritize the given entry so that in the next match-cycle it gets priority 
 * over ones with a lower priority.
 * @param {Object} entry - The entry to be prioritized.
*/
Matcher.prototype.prioritizeEntry = function(entry) {
	let index = this.indexOf(entry);
	if ( index !== -1 ) {
		Entry.prioritize(this.entries[index].id);
	}
};

/**
 * Check if the given entries fulfill the requirements for a match.
 * @param {Object} a - First entry
 * @param {Object} b - Second entry
 * @returns {Boolean} - True if they match, false if they dont match.
*/
Matcher.prototype.isMatch = function(a, b) {
	return Math.abs(a.player.strength - b.player.strength) < config.matchWindow;
};

/**
 * Starts the matching process
*/
Matcher.prototype.start = function() {
	if ( this.interval ) { this.stop(); }

	var self = this;
	this.interval = setInterval(function() {
		Matcher.prototype.match.call(self);
	}, config.matchInterval);

	process.on('SIGINT', function() {
		clearInterval(self.interval);
	});
};


/**
 * Stops the matching process
*/
Matcher.prototype.stop = function() {
	clearInterval(this.interval);
};

/**
 * Gets called in regular intervals and handles the matching process.
 * If a match is found the "match" event is triggered.
*/
Matcher.prototype.match = function() {
	let self = this;
	let	entries = this.entries.slice();
	entries.sort(function(a, b) {
		if ( self.isMatch(a,b) ) {
		  return b.priority - a.priority;
		}
		
		return b.player.strength - a.player.strength;
	});
	
	for ( let i = 0; i < entries.length - 1; i++ ) {
		if ( this.isMatch(entries[i], entries[i+1]) ) {
			this.removeEntry(entries[i]);
			this.removeEntry(entries[i+1]);
			this.emit('match', {
				players: [
					entries[i].player.id,
					entries[i+1].player.id
				]
			});

			i += 1;
		} else {
			this.prioritizeEntry(entries[i]);
		}
	}
};

/**
 * Expose the Matcher
*/
exports.Matcher = Matcher;
