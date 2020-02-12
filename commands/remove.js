module.exports = {
  name: 'remove',
  usage: '!cat remove [listing ID]',
  execute(args) {
    const db = require('../cat_modules/db').load();

    const ids = args.primary.split(',').map(id => `"${id}"`);
    const sql = `DELETE FROM listings
                 WHERE id in (${ids})
                 AND userId = "${args.user.id}"`;

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
            message: "I couldn't find any listings that belonged to you with the IDs given."
          });
        }
      });
    });
  },

  valid(args) {
    return !!args.primary;
  }
}
