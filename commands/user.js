const db = require('../cat_modules/db_query');

module.exports = {
  name: 'user',
  subCommands: {
    list: {
      usage: 'user list',
      description: 'Lists all users known to the catalogue',
      execute() {
        return db.all('SELECT * FROM users', 'users');
      }
    },

    makemeadmin: {
      usage: 'admin self',
      description: 'Make yourself an admin',
      excludeFromHelp: true,
      execute(args, user) {
        const { adminDiscordId } = require('../config.json');
        if (user.discordId !== adminDiscordId) return Promise.resolve({ message: "You don't have permission to use that command." });

        return db.run(
          `UPDATE users
           SET admin = 1
           WHERE discordId = "${adminDiscordId}"`
        );
      }
    },

    help: {
      usage: 'user help',
      description: 'Shows this',
      execute() {
        return Promise.resolve({
          success: true,
          type: 'help',
          message: module.exports.subCommands
        });
      }
    }
  }
}
