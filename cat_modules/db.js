const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
  connect: function() {
    _db = new sqlite3.Database('./db/catalogue.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(err.message);
      }
      _db.run(`CREATE TABLE IF NOT EXISTS listings (
                seller string,
                item string,
                price string,
                location string,
                CONSTRAINT unq UNIQUE (seller, item))`);
      console.log('Connected to the catalogue.');
      return _db;
    });
  },

  load: function() {
    return _db;
  }
}
