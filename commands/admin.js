const db = require("../db/config");

module.exports = {
  name: 'admin',
  adminLocked: true,
  subCommands: {
    toggle: {
      usage: 'admin toggle [Discord ID]',
      description: 'Toggle the admin status of a user',
      argsPattern: /(?<discordId>.+)/,
      execute(args) {
        return db('users')
          .where({ discordId: args.discordId })
          .update({
            admin: db.raw('NOT admin')
          }).then(result => {
          if (result) {
            return {
              message: "That's all done for you."
            }
          } else {
            return {
              message: "I couldn't find that user."
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
        return db('users')
          .where({ discordId: args.discordId })
          .del().then(result => {
            if (result) {
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
