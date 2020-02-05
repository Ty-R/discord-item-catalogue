module.exports = {
  name: 'purge',
  adminLocked: true,
  usage: '!cat purge [username]',
  execute(args) {
    const sqlite = require('../cat_modules/db');
    const db = sqlite.load();

    const actionResult = new Promise((resolve, reject) => {
      db.run(`DELETE FROM listings
              WHERE seller = "${args.primary}"`, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: 'Any listings by that user have been removed.'
          });
        } else {
          resolve({
            success: false,
            message: 'No listings were removed. If this was unexpected then double check the username given is exact.'
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
