const db = require('../cat_modules/db_query');

module.exports = {
  name: 'admin',
  adminLocked: true,
  subCommands: {
    toggle: {
      usage: 'admin toggle [Discord ID]',
      description: 'Toggle the admin status of a user',
      argsPattern: /(?<discordId>.+)/,
      execute(args) {
        return db.run(
          {
            query: `UPDATE users
                    SET admin = NOT admin
                    WHERE discordId = "${args.discordId}"`,
            success: "I've done that for you.",
            fail: "I was unable to change the admin status of that user."
          }

        );
      }
    },

    purge: {
      usage: 'admin purge [Discord ID]',
      description: 'Purge a user from the catalogue',
      argsPattern: /(?<discordId>.+)/,
      execute(args) {
        return db.run(
          `DELETE FROM users
           WHERE discordId = "${args.discordId}"`
        );
      }
    },
  
    help: {
      usage: 'admin help',
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
