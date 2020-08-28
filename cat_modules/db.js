const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
  connect(file) {
    _db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      _db.run(
        `CREATE TABLE IF NOT EXISTS users (
         id             INTEGER PRIMARY KEY,
         discordId      TEXT UNIQUE,
         name           TEXT,
         admin          BOOLEAN DEFAULT 0,
         defaultSeller  INTEGER REFERENCES sellers(id) ON DELETE SET NULL)`
      );

      _db.run(
        `CREATE TABLE IF NOT EXISTS sellers (
         id          INTEGER PRIMARY KEY,
         name        TEXT UNIQUE,
         location    TEXT,
         icon        TEXT,
         colour      STRING,
         description TEXT,
         active      BOOLEAN DEFAULT 1,
         userId      INTEGER REFERENCES users(id) ON DELETE CASCADE)`
      );

      _db.run(
        `CREATE TABLE IF NOT EXISTS listings (
         id       INTEGER PRIMARY KEY,
         item     TEXT,
         price    TEXT,
         userId   INTEGER REFERENCES users(id) ON DELETE CASCADE,
         sellerId INTEGER REFERENCES sellers(id) ON DELETE CASCADE)`
      );
    });

    _db.get("PRAGMA foreign_keys = ON");

    return _db;
  },

  load() {
    return _db;
  }
}
