'use strict';

let util = require('util'),
	  getClient = require('./../config/postgres'),
		config = require('./../config/config').postgres;

let Entry = function(data) {
	this.id = data.id;
	this.priority = data.priority || 1;
	this.player = {
		id: data.playerid,
		strength: data.playerstrength
	};
};

let prioritize = exports.prioritize = function(entry) {
	entry.priority += 1;
	let q = util.format("UPDATE %s SET priority = %d WHERE id = %d RETURNING id, priority, playerid, playerstrength", config.table, entry.priority, entry.id);

	return getClient.then(function(client) {
		return client.queryAsync(q);
	}).then(function(result) {
		if ( result.rows[0] ) {
			return new Entry(result.rows[0]);
		}
	});
};

let findById = exports.findById = function(id) {
	let q = util.format("SELECT * FROM %s WHERE id = %d", config.table, id);

	return getClient.then(function(client) {
		return client.queryAsync(q);
	}).then(function(result) {
		if ( result.rows[0] ) {
			return new Entry(result.rows[0]);
		}
	});
};

let findAll = exports.findAll = function() {
	let q = util.format("SELECT * FROM %s", config.table);

	return getClient.then(function(client) {
		return client.queryAsync(q);
	}).then(function(result) {
		return result.rows.map(function(row) {
			return new Entry(row);
		});
	});
};

let save = exports.save = function(entry) {
	let q = util.format("INSERT INTO %s VALUES (DEFAULT, %d, '%s', %d) RETURNING id, priority, playerid, playerstrength", config.table, entry.priority, entry.player.id, entry.player.strength);

	return getClient.then(function(client) {
		return client.queryAsync(q);
	}).then(function(result) {
		if ( result.rows[0] ) {
			return new Entry(result.rows[0]);
		}
	});
};

let remove = exports.delete = function(id) {
	let q = util.format("DELETE FROM %s WHERE id = %d", config.table, id);

	return getClient.then(function(client) {
		return client.queryAsync(q);
	});
};

exports.Entry = Entry;
