module.exports = {
  name: 'purge',
  adminLocked: true,
  usage: '!cat purge [username]',
  execute(message, args) {
    const logger = require('winston');
    const catalogueSearch = require('../cat_modules/search_catalogue');
    const sqlite = require('../cat_modules/db');
    const { admin_ids } = require('../config.json');
    const db = sqlite.load();
    const user = message.author.username;

    db.run(`DELETE FROM listings
            WHERE seller = "${args.primary}"`, (err) => {
        if (err) logger.error(err);
        message.channel.send(`Hi, ${user}! Any listings by that user have been removed.`);
      });             

  },

  valid(args) {
    return !!args.primary;
  }
}
