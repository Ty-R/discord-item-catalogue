module.exports = {
  name: 'remove',
  usage: '!cat remove [listing ID]',
  execute(message, args) {
    const logger = require('winston');
    const catalogueSearch = require('../cat_modules/search_catalogue');
    const sqlite = require('../cat_modules/db');
    const { admin_ids } = require('../config.json');
    const db = sqlite.load();
    const user = message.author.username;
    const admin = admin_ids.includes(message.author.id);

    const ids = args.primary.split(', ')

    const sql = `DELETE FROM listings
                 WHERE rowid in (${ids})
                 AND seller ${admin ? "LIKE '%'" : `= "${user}"`}`

    db.run(sql, function(err) {
      if (err) logger.error(err);
      if (this.changes === 1) {
        message.channel.send(`Hi, ${user}! I've removed that listing for you.`);
      } else if (this.changes > 1) {
        message.channel.send(`Hi, ${user}! I've removed those listings for you.`);
      } else {
        message.channel.send(`Sorry, ${user}. I couldn't find any listings that belonged to you with the IDs given.`);
      }
    });
  },

  valid(args) {
    return !!args.primary;
  }
}
