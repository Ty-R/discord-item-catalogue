const db = require('../cat_modules/db_query');

module.exports = {
  name: 'admin',
  adminLocked: true,
  subCommands: {
    add: {
      usage: 'admin add [Discord ID]',
      description: 'Make a user a catalogue admin.',
      argsPattern: '(?<discordId>.+)',
      execute(args) {
        return db.run(
          `UPDATE users
           SET admin = 1
           WHERE discordId = "${args.discordId}"`
        );
      }
    },

    remove: {
      usage: 'admin remove [Discord ID]',
      description: 'Remove admin status from a user.',
      argsPattern: '(?<discordId>.+)',
      execute(args) {
        return db.run(
          `UPDATE users
           SET admin = 0
           WHERE discordId = "${args.discordId}"`
        );
      }
    },

    purge: {
      usage: 'admin purge [Discord ID]',
      description: 'Purge a user from the catalogue.',
      argsPattern: '(?<discordId>.+)',
      execute(args) {
        return db.run(
          `DELETE FROM users
           WHERE discordId = "${args.discordId}"`
        );
      }
    },
  
    help: {
      usage: 'admin help',
      description: 'Shows this.',
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
