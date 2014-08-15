'use strict';

let util = require('util'),
		Entry = require('./entry'),
		config = require('./../config/config'),
		EventEmitter = require('events').EventEmitter;

let Matcher = function(entries) {
	this.entries = entries || [];
};

util.inherits(Matcher, EventEmitter);

Matcher.prototype.indexOf = function(entry) {
	for (let i = 0; i < this.entries.length; i++) {
		if ( this.entries[i].id === entry.id ) {
			return i;
		}
	}

	return -1;
};

Matcher.prototype.addEntry = function(entry) {
	let self = this;	
	return Entry.save(entry).then(function(entry) {
		self.entries.push(entry);
	});
};

Matcher.prototype.removeEntry = function(entry) {
	let index = this.indexOf(entry);
	if ( index !== -1 ) {
		this.entries.splice(index, 1);
	}

	return Entry.delete(entry.id);
};

Matcher.prototype.prioritizeEntry = function(entry) {
	let index = this.indexOf(entry);
	if ( index !== -1 ) {
		Entry.prioritize(this.entries[index]);
	}
};

Matcher.prototype.isMatch = function(a, b) {
	return Math.abs(a.player.strength - b.player.strength) < config.matchWindow;
};

Matcher.prototype.start = function() {
	var self = this;
	this.interval = setInterval(function() {
		Matcher.prototype.match.call(self);
	}, config.matchInterval);

	process.on('SIGINT', function() {
		clearInterval(self.interval);
	});
};

Matcher.prototype.stop = function() {
	clearInterval(this.interval);
};

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
			this.emit('match', entries[i].player.strength + ' - ' + entries[i+1].player.strength);
			i += 1;
		} else {
			this.prioritizeEntry(entries[i]);
		}
	}
};

exports.Matcher = Matcher;