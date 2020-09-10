const db = require('./db').load();

module.exports = {
  run(args) {
    return new Promise((resolve, reject) => {
      db.run(args.query, function(err) {
        if (err && err.code !== 'SQLITE_CONSTRAINT') {
          reject(err);
        };

        resolve({
          success: this.changes > 0
        });
      });
    });
  },

  all(args) {
    return new Promise((resolve, reject) => {
      db.all(args.query, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  },

  get(args) {
    return new Promise((resolve, reject) => {
      db.get(args.query, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }
}
