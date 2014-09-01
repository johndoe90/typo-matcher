'use strict';

let util = require('util'),
	backup = require('./backup'),
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
 * @param {string} id - The id to look for.
 * @returns {Number} - If the entry is not found -1 is returned.
*/
Matcher.prototype.indexOf = function(id) {
	for ( let i = 0; i < this.entries.length; i++ ) {
		if ( this.entries[i].id === id ) {
			return i;
		}
	}

	return -1;
};

/**
 * Add an entry to the pool.
 * @param {Object} entry - The entry to add.
*/
Matcher.prototype.add = function(entry) {
	let self = this;
	if ( this.indexOf(entry.id) === -1 ) {
		/*backup.save(entry.id, JSON.stringify(entry)).then(function() {
			self.entries.push(entry);
		});*/
		backup.save(entry.id, JSON.stringify(entry));
		self.entries.push(entry);
	}
};

/**
 * Remove and the entry at the given position
 * @param {Number} index - the index in the array
*/
Matcher.prototype.removeAt = function(index) {
	backup.delete(this.entries[index].id);
	this.entries.splice(index, 1);
};

/**
 * Remove and entry from the pool.
 * @param {string} id - The entry id to remove.
*/
Matcher.prototype.remove = function(id) {
	let index = this.indexOf(id);
	if ( index !== -1 ) {
		this.removeAt(index);
	}
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
 * Determines how well two entries match
 * @param {Object} entryA - first entry
 * @param {Object} entryB - second entry
 * @returns {Number} - if they dont match 0 is returned
*/
Matcher.prototype.calcScore = function(entryA, entryB) {
	let key, i, criteria, criterion, result, score = 0;
	for ( key in entryA.criteria ) {
		criteria = entryA.criteria[key];
		for ( i = 0; i < criteria.length; i++ ) {
			criterion = criteria[i];

			result = criterion.test.call(entryA, entryB[key]);

			if ( result > 0 ) {
				score += result;
			} else if ( criterion.optional === false ) {
				return 0;
			}
		}
	}

	return score;
};

/**
 * Gets called in regular intervals and handles the matching process.
 * If a match is found the "match" event is triggered.
*/
Matcher.prototype.match = function() {
	let now = new Date().getTime();

	this.entries.sort(function(entryA, entryB) {
		return entryA.date - entryB.date;
	});

	let j, match, score, highScore, length = this.entries.length;
	for ( let i = 0; i < (length - 1); i++ ) {
		match = null;
		highScore = 0;
		for ( j = i + 1; j < length; j++ ) {
			score = this.calcScore(this.entries[i], this.entries[j]);
			if ( score > highScore ) {
				highScore = score;
				match = this.entries[j];
				match.index = j;
			}

			if ( match && (j - i) % config.findBestOf === 0) {
				break;
			}
		}

		if ( match ) {
			//just send both to game starter
			this.emit('match', {players: [this.entries[i].strength, this.entries[i].languages, match.strength, match.languages]});

			this.removeAt(match.index);
			this.removeAt(i);
			i--;

			length = this.entries.length;
		}
	}
};

module.exports = Matcher;