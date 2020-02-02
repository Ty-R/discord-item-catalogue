module.exports = {
  name: 'purge',
  adminLocked: true,
  usage: '!cat purge [username]',
  execute(message, args) {
    const logger = require('winston');
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();

    db.run(`DELETE FROM listings
            WHERE seller = "${args.primary}"`, (err) => {
        if (err) logger.error(err);
        message.channel.send('Any listings by that user have been removed.');
      });
  },

  valid(args) {
    return !!args.primary;
  }
}
