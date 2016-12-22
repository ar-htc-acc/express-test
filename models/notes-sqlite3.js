'use strict';

const util = require('util');
const sqlite3 = require('sqlite3');

const log = require('debug')('notes:sqlite3-model');
const error = require('debug')('notes:error');

const Note = require('./Note');

sqlite3.verbose();
var db;

exports.connectDB = function () {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        var dbfile = process.env.SQLITE_FILE || "notes.sqlite3";
        db = new sqlite3.Database(dbfile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            err => {
                if (err) reject(err);
                else {
                    log('Opened SQLite3 database: ' + dbfile);
                    resolve(db);
                }
            });
    });
};

exports.create = function (key, title, body) {
    return exports.connectDB().then(() => {
        var note = new Note(key, title, body);
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO notes ( key, title, body) VALUES ( ?, ?, ?);", [key, title, body],
                err => {
                    if (err) reject(err);
                    else {
                        log('CREATE ' + util.inspect(note));
                        resolve(note);
                    }
                });
        })
    });
};

exports.update = function (key, title, body) {
    return exports.connectDB().then(() => {
        var note = new Note(key, title, body);
        return new Promise((resolve, reject) => {
            db.run("UPDATE notes " +
                "SET title = ?, body = ? WHERE key = ?",
                [title, body, key], err => {
                    if (err) reject(err);
                    else {
                        log('UPDATE ' + util.inspect(note));
                        resolve(note);
                    }
                });
        })
    });
};

exports.read = function (key) {
    return exports.connectDB().then(() => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM notes WHERE key = ?", [key],
                (err, row) => {
                    if (err) reject(err);
                    else {
                        var note = new Note(row.key, row.title, row.body);
                        log('READ' + util.inspect(note));
                        resolve(note);
                    }
                }
            );
        });
    });
};

exports.destroy = function (key) {
    return exports.connectDB().then(() => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM notes WHERE key = ?;", [key],
                err => {
                    if (err) reject(err);
                    else {
                        log('DESTROY: ' + key);
                        resolve();
                    }
                });
        });
    });
}

exports.keylist = function () {
    return exports.connectDB().then(() => {
        return new Promise((resolve, reject) => {
            var keyz = [];
            db.each("SELECT key FROM notes",
                (err, row) => {
                    if (err) reject(err);
                    else keyz.push(row.key);
                },
                (err, num) => {
                    if (err) reject(err);
                    else resolve(keyz);
                });
        });
    });
};

exports.count = function () {
    return exports.connectDB().then(() => {
        return new Promise((resolve, reject) => {
            db.get("select count(key) as count from notes",
                (err,row) => {
                    if (err) return reject(err);
                    resolve(row.count);
                });
        });
    });
};











