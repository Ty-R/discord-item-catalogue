module.exports = {
  name: 'add',
  usage: 'add [item]:[price]',
  execute(args) {
    const db = require('../cat_modules/db').load();
    const sql = `INSERT INTO listings (item, price, userId, location)
                 VALUES (?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.run(sql, [args.primary, args.secondary, args.user.id, args.optional], function(err) {
        if (err) reject(err);
        resolve({ 
          success: true,
          message: `I've added **${args.primary}** to the catalogue for you with an listing ID of **${this.lastID}**.`
        });
      });
    });
  },

  valid(args) {
    return !!args.primary && !!args.secondary;
  }
}
