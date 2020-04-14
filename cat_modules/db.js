const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
  connect(file) {
    _db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      _db.run(`CREATE TABLE IF NOT EXISTS users (
               id         INTEGER PRIMARY KEY,
               discordId  TEXT UNIQUE,
               name       TEXT,
               admin      BOOLEAN DEFAULT 0)`);

      _db.run(`CREATE TABLE IF NOT EXISTS sellers (
                id         INTEGER PRIMARY KEY,
                name       TEXT,
                location   TEXT,
                icon       TEXT,
                colour     STRING,
                description TEXT,
                userId     INTEGER,
                FOREIGN KEY(userId)
                REFERENCES users(id)
                ON DELETE CASCADE)`);

      _db.run(`CREATE TABLE IF NOT EXISTS listings (
               id       INTEGER PRIMARY KEY,
               item     TEXT,
               price    TEXT,
               sellerId INTEGER,
               FOREIGN KEY(sellerId)
               REFERENCES sellers(id)
               ON DELETE CASCADE)`);
    });

    return _db;
  },

  load() {
    return _db;
  }
}
