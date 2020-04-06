module.exports = {
  name: 'remove',
  requiredArgs: ['ids'],
  usage: 'remove [listing ID]',
  execute(args, user) {
    const db = require('../cat_modules/db').load();

    const ids = args.ids.split(',').map(id => `"${id}"`);
    const sql = `DELETE FROM listings
                 WHERE id in (${ids})
                 AND userId = "${user.id}"`;

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
  }
}
