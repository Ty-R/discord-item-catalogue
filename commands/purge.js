module.exports = {
  name: 'purge',
  adminLocked: true,
  usage: '!cat purge [Discord ID]',
  execute(args) {
    const db = require('../cat_modules/db').load();

    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM users
              WHERE discordId = "${args.primary}"`, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: 'That user, and any listings belonging to that user, have been removed from the catalogue.'
          });
        } else {
          resolve({
            success: false,
            message: "I couldn't find a user in the catalogue with that ID, are you sure it's correct?"
          });
        }
      });
    });
  },

  valid(args) {
    return !!args.primary;
  }
}
