exports.run = (sql) => {
  const sqlite = require('./../cat_modules/db');
  const db = sqlite.load();

  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
