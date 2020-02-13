module.exports = {
  name: 'seller',
  usage: 'seller name : [seller name]',
  execute(args) {
    const db = require('../cat_modules/db').load();
    let sql = `UPDATE users
               SET name = "${args.secondary}"
               WHERE discordId = "${args.user.discordId}"`;

    return new Promise((resolve, reject) => {
      db.run(sql, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: "That's all done for you."
          });
        } else {
          resolve({
            success: false,
            message: 'Something went wrong.. please try again, or notify the author if this keeps happening.'
          });
        }
      })
    })
  },

  valid(args) {
    return ['name'].includes(args.primary) && !!args.secondary
  }
}
