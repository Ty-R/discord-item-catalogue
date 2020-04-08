const db = require('../cat_modules/db').load();

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Returns a list of sellers',
    },
    add: {
      usage: 'seller add [name]',
      description: 'Adds a new seller',
    },
    remove: {
      usage: 'seller remove [seller ID]',
      description: 'Removes an existing seller',
    },

    help: {
      usage: 'listing help',
      description: 'Shows this',
      execute() {
        return {
          success: true,
          type: 'help',
          message: module.exports.subCommands
        }
      }
    }
  }
}
