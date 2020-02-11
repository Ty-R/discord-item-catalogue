const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
  connect(file) {
    _db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      _db.run(`CREATE TABLE IF NOT EXISTS users (
               id         INTEGER PRIMARY KEY,
               discordId  TEXT UNIQUE,
               name       TEXT,
               admin      BOOLEAN)`);

      _db.run(`CREATE TABLE IF NOT EXISTS listings (
               id       INTEGER PRIMARY KEY,
               item     TEXT,
               price    TEXT,
               userId   INTEGER,
               location TEXT,
               FOREIGN KEY(userId) REFERENCES users(id))`);
    });

    return _db;
  },

  load() {
    return _db;
  }
}
