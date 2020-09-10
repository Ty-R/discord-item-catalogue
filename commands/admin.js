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
        return db.run({
          query: `UPDATE users
                  SET admin = NOT admin
                  WHERE discordId = "${args.discordId}"`
        }).then(result => {
          if (result.success) {
            return {
              message: "I've toggled that user's admin status."
            }
          } else {
            return {
              message: 'I was unable to find a user using that Discord ID.'
            }
          }
        });
      }
    },

    purge: {
      usage: 'admin purge [Discord ID]',
      description: 'Purge a user from the catalogue',
      argsPattern: /(?<discordId>.+)/,
      execute(args) {
        return db.run({
          query: `DELETE FROM users
                  WHERE discordId = "${args.discordId}"`
        }).then(result => {
          if (result.success) {
            return {
              message: "I've removed that user, their sellers, and their listings from the catalogue."
            }
          } else {
            return {
              message: 'I was unable to find a user using that Discord ID.'
            }
          }
        });
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
