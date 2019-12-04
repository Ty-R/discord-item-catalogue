exports.run = (args) => {
  const logger = require('winston');
  const queryFromFlag = require('../cat_modules/query_from_flag');
  const sqlite = require('./../cat_modules/db');
  const db = sqlite.load();

  // let flag = args.flag;
  // let query;

  // if (args.action == 'update') {
  //   flag = 'i';
  // } else if (args.primary.startsWith('@')) {
  //   args.primary = args.primary.substring(1);
  //   flag = 'l';
  // }

  // args.primary = args.primary.replace('*', '');

  // query = queryFromFlag.run(flag);

  // logger.info(`Searching catalogue for: "${args.primary}" by: "${query}"`);

  // try {
  //   const listings = catalogue.listings.filter(listing => listing[query]);
  //   return listings.filter(listing => listing[query].toLowerCase().includes(args.primary.toLowerCase()));
  // } catch(error) {
  //   logger.error(`Search for '${query}' failed: ${error}.`);
  //   return [];
  // }

  return new Promise((resolve, reject) => {
    db.all(`SELECT *
            FROM listings
            WHERE LOWER(${queryFromFlag.run(args.flag)})
            LIKE LOWER("${args.primary}%")`, (err, rows) => {
      if (err) {
        reject(console.error(err));
      }
      resolve(rows);
    });
  });
}
