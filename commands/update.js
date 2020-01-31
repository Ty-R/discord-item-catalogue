module.exports = {
  name: 'update',
  usage: '!cat update [option] [item]:[term]',
  execute(message, args) {
    const logger = require('winston');
    const catalogueSearch = require('../cat_modules/search_catalogue');
    const queryFromFlag = require('../cat_modules/query_from_flag');
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();
    const user = message.author.username;

    let sql = `SELECT rowid, * FROM listings
               WHERE item = "${args.primary}"
               AND seller = "${user}"`

    const listingsSearch = catalogueSearch.run(sql);

    listingsSearch.then((listing) => {
      if (listing.length) {
        let sql = `UPDATE listings
                   SET ${queryFromFlag.run(args.flag)} = ?
                   WHERE rowid = ${listing[0].rowid}`;

        db.run(sql, args.secondary, (err) => {
          if (err) logger.error(err);
          message.channel.send(`Hi, ${user}! I've updated that listing for you.`);
        });
      } else {
        message.channel.send(`Hi, ${user}! I couldn't find a listing for **${args.primary}** that belongs to you.`);
      }
    }).catch((err) => logger.info(err));
  },

  valid(args) {
    return !!args.flag && !!args.primary && !!args.secondary;
  }
}
