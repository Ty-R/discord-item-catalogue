module.exports = {
  name: 'remove',
  usage: '!cat remove [item]',
  execute(message, args) {
    const logger = require('winston');
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const sqlite = require('./../cat_modules/db');
    const db = sqlite.load();
    const user = message.author.username;

    const sql = `SELECT rowid, * FROM listings
                 WHERE item = "${args.primary}"
                 AND seller = "${user}"
                 LIMIT 1`

    const listingsSearch = catalogueSearch.run(sql);

    listingsSearch.then((listings) => {
      if (listings.length) {
        db.run(`DELETE FROM listings
                WHERE rowid = ${listings[0].rowid}`, (err) => {
          if (err) logger.error(err);
          message.channel.send(`Hi, ${user}! I've removed your **${args.primary}** listing`);
        });
      } else {
        message.channel.send(`Hi, ${user}! I couldn't find a listing for **${args.primary}** that belongs to you.`);
      }
    }).catch((err) => logger.error(err));
  },

  valid(args) {
    return !!args.primary;
  }
}
