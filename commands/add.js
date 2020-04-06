module.exports = {
  name: 'add',
  requiredArgs: ['item', 'price'],
  usage: 'add [item]:[price]',
  execute(args, user) {
    const db = require('../cat_modules/db').load();
    const sql = `INSERT INTO listings (item, price, userId)
                 VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.run(sql, [args.item, args.price, user.id], function(err) {
        if (err) reject(err);
        resolve({ 
          success: true,
          message: `I've added **${args.item}** to the catalogue for you with an listing ID of **${this.lastID}**.`
        });
      });
    });
  }
}
