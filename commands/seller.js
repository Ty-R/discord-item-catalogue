const db = require('../cat_modules/db_query');

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers',
      execute() {
        return db.all({
          query: `SELECT sellers.* FROM sellers`
        }).then((sellers) => {
          if (sellers.length > 0) {
            return {
              success: true,
              message: "Here you go:\n\n" + sellers.map(seller => `• [${seller.id}] ${seller.name}`).join("\n")
            };
          } else {
            return {
              message: 'There are no sellers in the catalogue yet.'
            };
          };
        }).catch(error => Promise.reject(error));
      }
    },

    add: {
      usage: 'seller add [name]',
      description: 'Adds a new seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args, user) {
        return db.run({
          query: `INSERT INTO sellers (name, userId)
                  VALUES ("${args.sellerName}", ${user.id})`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: "I've added that seller for you."
            }
          } else {
            return {
              message: 'A seller by that name already exists.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },

    remove: {
      usage: 'seller remove [id]',
      description: 'Removes a seller and any listings it holds',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        return db.run({
          query: `DELETE FROM sellers
                  WHERE id = ${args.sellerId}
                  ${user.admin ? '' : `AND userId = ${user.id}`}`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: "That seller (and its listings) has been removed from the catalogue."
            }
          } else {
            return {
              message: 'I was unable to find your seller with that ID.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },

    update: {
      usage: 'seller update [id] [field]:[value|unset]',
      description: 'Updates the field of a seller - name, location, icon, description',
      argsPattern: /(?<sellerId>[0-9]+)\s(?<field>name|location|icon|description)\s*:\s*(?<value>.+)/i,
      execute(args, user) {
        const field = args.field.toLowerCase();
        if (args.value === 'unset') args.value = null;
        return db.run({
          query: `UPDATE sellers
                  SET "${field}" = nullif("${args.value}", "null")
                  WHERE id = "${args.sellerId}"
                  ${user.admin ? '' : `AND userId = ${user.id}`}`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: `I've updated that seller's ${args.field} for you.`
            }
          } else {
            return {
              message: 'I was unable to find your seller with that ID.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },
  
    inventory: {
      usage: 'seller inventory [name|id]',
      description: 'Lists the inventory of a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return db.all({
          query: `SELECT listings.id, listings.item, listings.price, sellers.name
                  FROM listings
                  INNER JOIN sellers on sellers.id = listings.sellerId
                  WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                  OR sellers.id = "${args.sellerName}"`
        }).then((listings) => {
          if (listings.length > 0) {
            return {
              success: true,
              message: "Here's what they sell:\n\n" + listings.map((row) => `• [${row.id}] ${row.item} for ${row.price}`).join("\n")
            };
          } else {
            return {
              message: "I couldn't find anything. That seller either doesn't exist or isn't currently selling anything."
            };
          };
        }).catch(error => Promise.reject(error));
      }
    },

    info: {
      usage: 'seller info [name|id]',
      description: 'Shows information about a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return db.get({
          query: `SELECT sellers.*, users.name AS "owner"
                  FROM sellers
                  LEFT JOIN users ON users.id = sellers.userId
                  WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                  OR sellers.id = "${args.sellerName}"`
        }).then((seller) => {
          if (seller) {
            return {
              success: true,
              message: {
                "embed": {
                  "color": `${seller.colour || '3447003'}`,
                  "thumbnail": {
                    "url": `${seller.icon || ''}`
                  },
                  "fields": [
                    {
                      "name": "ID",
                      "value": `${seller.id}`,
                      "inline": true,
                    },
                    {
                      "name": "Name",
                      "value": `${seller.name}`,
                      "inline": true
                    },
                    {
                      "name": "Active",
                      "value": `${seller.active ? 'Yes' : 'No'}`
                    },
                    {
                      "name": "Location",
                      "value": `${seller.location || '--'}`
                    },
                    {
                      "name": "Owner",
                      "value": `${seller.owner}`
                    },
                    {
                      "name": "Description",
                      "value": `${seller.description || '--'}`
                    }
                  ]
                }
              }
            }
          } else {
            return {
              message: 'I was unable to find that seller.'
            };
          }
        }).catch(error => Promise.reject(error));
      }
    },

    default: {
      usage: 'seller default [id]',
      description: 'Sets a default seller for new listings',
      argsPattern: /(?<sellerId>[0-9]*)/,
      execute(args, user) {
        if (!args.sellerId) return Promise.resolve({
            success: true,
            message: `Your current default seller is ${user.defaultSeller || 'not set'}`
        });

        return db.get({
          query: `SELECT id FROM sellers WHERE id = ${args.sellerId} AND userId = ${user.id}`
        }).then(seller => {
          if (!seller) return {
            message: 'I was unable to find your seller by that ID.'
          }
          return db.run({
            query: `UPDATE users
                    SET defaultSeller = ${seller.id}
                    WHERE id = ${user.id}`,
          }).then(result => {
            if (result.success) {
              return {
                success: true,
                message: "I've set that as your default seller."
              }
            } else {
              return {
                message: 'I was unable to find your seller by that ID.'
              }
            }
          }).catch(error => Promise.reject(error));
        }).catch(error => Promise.reject(error));
      }
    },

    toggle: {
      usage: 'seller toggle [id]',
      description: 'Toggle seller visibility',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        if (user.admin) user.id = user.id;
        return db.run({
          query: `UPDATE sellers
                  SET active = NOT active
                  WHERE id = "${args.sellerId}"`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: "I've toggled that seller for you"
            }
          } else {
            return {
              message: 'I was unable to find your seller by that ID.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },

    help: {
      usage: 'seller help',
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
