const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
  connect: function(file) {
    _db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(err.message);
      }
      _db.run(`CREATE TABLE IF NOT EXISTS listings (
               seller   TEXT,
               item     TEXT,
               price    TEXT,
               location TEXT,
               CONSTRAINT unq UNIQUE (seller, item))`);
      console.log('Catalogue loaded.');
      return _db;
    });
  },

  load: function() {
    return _db;
  }
}
