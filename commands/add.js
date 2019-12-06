module.exports = {
  name: 'add',
  usage: '!cat add [item]:[price]',
  execute(message, args) {
    const sqlite = require('./../cat_modules/db');
    const db = sqlite.load();
    const user = message.author.username;

    const sql = `INSERT INTO listings (seller, item, price, location)
                 VALUES (?, ?, ?, ?)`

    db.run(sql, [user, args.primary, args.secondary, args.optional], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') return message.channel.send(`Hi, ${user}! You already have a **${args.primary}** listing.`);
      } else {
        return message.channel.send(`Hi, ${user}! I've added **${args.primary}** to the catalogue for you`);
      }
    });    
  },

  valid(args) {
    return !!args.primary && !!args.secondary;
  }
}
