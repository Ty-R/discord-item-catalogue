module.exports = {
  name: 'delete',
  adminLocked: true,
  requiredArgs: ['ids'],
  usage: 'delete [listing ID]',
  execute(args) {
    const db = require('../cat_modules/db').load();

    const ids = args.ids.split(',').map(id => `"${id}"`);

    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM listings
              WHERE rowid in (${ids})`, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: "That's all done for you."
          });
        } else {
          resolve({
            success: false,
            message: 'No listings were removed. If this was unexpected then double check the IDs given.'
          });
        }
      });
    });
  }
}
