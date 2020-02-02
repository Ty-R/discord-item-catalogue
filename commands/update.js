module.exports = {
  name: 'update',
  usage: '!cat update [option] [listing ID]:[updated value]',
  execute(message, args) {
    const logger = require('winston');
    const catalogueSearch = require('../cat_modules/search_catalogue');
    const queryFromFlag = require('../cat_modules/query_from_flag');
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();
    const user = message.author.username;

    let sql = `UPDATE listings
               SET ${queryFromFlag.run(args.flag)} = ?
               WHERE rowid = "${args.primary}"
               AND seller = "${user}"`;

    db.run(sql, args.secondary, function(err) {
      if (err) logger.error(err);
      if (this.changes > 0) {
        message.channel.send(`Hi, ${user}! I've updated that listing for you.`);
      } else {
        message.channel.send(`Sorry, ${user}. I couldn't find any listings that belonged to you with the ID given.`);
      }
    });
  },

  valid(args) {
    return !!args.flag && !!args.primary && !!args.secondary;
  }
}
