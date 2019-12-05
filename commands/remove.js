module.exports = {
  name: 'remove',
  usage: '!cat remove [item]',
  execute(message, catalogue, args) {
    const logger = require('winston');
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const sqlite = require('./../cat_modules/db');
    const db = sqlite.load();
    const user = message.author.username;

    const listing = catalogueSearch.run(args).find(e => e.seller === user && e.item === args.primary);

    if (listing) {
      db.run(`DELETE FROM listings
              WHERE rowid = ?`, listing.id, (err) => {
        if (err) {
          logger.error(err);
        }
        message.channel.send(`Hi, ${user}! I've removed your **${args.primary}** listing`);
      });
    } else {
      message.channel.send(`Hi, ${user}! I couldn't find a listing for **${args.primary}** that belongs to you.`);
    }
  },

  valid(args) {
    return !!args.primary;
  }
}
