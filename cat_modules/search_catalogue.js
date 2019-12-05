exports.run = (args) => {
  const logger = require('winston');
  const queryFromFlag = require('../cat_modules/query_from_flag');
  const sqlite = require('./../cat_modules/db');
  const db = sqlite.load();

  return new Promise((resolve, reject) => {
    db.all(`SELECT *
            FROM listings
            WHERE LOWER(${queryFromFlag.run(args.flag)})
            LIKE LOWER("${args.primary}%")`, (err, rows) => {
      if (err) {
        reject(logger.error(err));
      }
      resolve(rows);
    });
  });
}
