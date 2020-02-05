module.exports = {
  name: 'remove',
  usage: '!cat remove [listing ID]',
  execute(args) {
    const userIsAdmin = require('../cat_modules/admin_check');
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();

    const ids = args.primary.split(', ').map(id => `"${id}"`);
    const sql = `DELETE FROM listings
                 WHERE rowid in (${ids})
                 AND seller ${userIsAdmin.run(args.userId) ? "LIKE '%'" : `= "${args.user}"`}`;

    const actionResult = new Promise((resolve, reject) => {
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
            message: "I couldn't find any listings that belonged to you with the IDs given."
          });
        }
      });
    });

    return actionResult;
  },

  valid(args) {
    return !!args.primary;
  }
}
