exports.run = (sql) => {
  const logger = require('winston');
  const sqlite = require('./db');
  const db = sqlite.load();

  logger.info(sql)

  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
