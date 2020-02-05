module.exports = {
  name: 'add',
  usage: '!cat add [item]:[price]',
  execute(args) {
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();
    const sql = `INSERT INTO listings (seller, item, price, location)
                 VALUES (?, ?, ?, ?)`;

    const actionResult = new Promise((resolve, reject) => {
      db.run(sql, [args.user, args.primary, args.secondary, args.optional], function(err) {
        if (err && err.code === 'SQLITE_CONSTRAINT') {
          resolve({ 
            success: false,
            message: `You already have a **${args.primary}** listing.`
          });
        } else {
          resolve({ 
            success: true,
            message: `I've added **${args.primary}** to the catalogue for you with an listing ID of **${this.lastID}**. You'll need this ID to remove or update this listing later.`
          });
        }
      });
    });

    return actionResult;
  },

  valid(args) {
    return !!args.primary && !!args.secondary;
  }
}
