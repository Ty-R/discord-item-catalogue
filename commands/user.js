const db = require("../db/config");

module.exports = {
  name: 'user',
  subCommands: {
    list: {
      usage: 'user list',
      description: 'Lists all users known to the catalogue',
      execute() {
        return db('users').then(users => {
          return {
            success: true,
            message: "Here they are:\n\n" + users.map(user => `• [${user.discordId}] ${user.name}`).join("\n")
          }
        });
      }
    },

    makemeadmin: {
      usage: 'admin self',
      description: 'Make yourself an admin',
      excludeFromHelp: true,
      execute(args, user) {
        const { adminDiscordId } = require('../config.json');
        if (user.discordId !== adminDiscordId) return Promise.resolve({ message: "You don't have permission to use that command." });

        return db('users')
          .where({ discordId: adminDiscordId })
          .update({ admin: 1 }).then(() => {
            return {
              success: true,
              message: "I've made you an admin."
            }
          })
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
