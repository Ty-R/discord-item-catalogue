module.exports = {
  name: 'admin',
  adminLocked: true,
  requiredArgs: ['action', 'discord_id'],
  usage: 'admin [add|remove]:[Discord ID]',
  execute(args) {
    const db = require('../cat_modules/db').load();
    let sql = `UPDATE users
               SET admin = ?
               WHERE discordId = "${args.discord_id}"`;

    const val = args.action === 'add' ? '1' : '0'

    return new Promise((resolve, reject) => {
      db.run(sql, val, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: "That's all done for you."
          });
        } else {
          resolve({
            success: false,
            message: 'No user was found with that Discord ID.'
          });
        }
      })
    })
  }
}
