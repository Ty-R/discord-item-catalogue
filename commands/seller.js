const db = require('../cat_modules/db_query');

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers',
      execute() {
        return new Promise((resolve, reject) => {
          db.all({
            query: `SELECT sellers.*, count(listings.id) AS listings
                    FROM sellers
                    LEFT JOIN listings ON listings.sellerID = sellers.id
                    GROUP BY sellers.id`
          }).then((sellers) => {
            if (sellers.length > 0) {
              resolve({
                success: true,
                message: "Here you go:\n\n" + sellers.map(seller => `• [${seller.id}] ${seller.name}`).join("\n")
              });
            } else {
              resolve({
                message: 'There are no sellers in the catalogue yet.'
              });
            };
          }).catch((reason) => {
            reject(reason);
          });
        });
      }
    },

    add: {
      usage: 'seller add [name]',
      description: 'Adds a new seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args, user) {
        return db.run({
          query: `INSERT INTO sellers (name, userId)
                  VALUES ("${args.sellerName}", ${user.id})`,
          success: "I've added that seller for you.",
          fail: 'I was unable to add that seller.'
        });
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
                  ${user.admin ? '' : `AND userId = ${user.id}`}`,
          success: 'That seller, and any listings it had, have been removed from the catalogue.',
          fail: 'I was unable to find your seller with that ID.'
        });
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
                  ${user.admin ? '' : `AND userId = ${user.id}`}`,
          success: `I've updated that seller's ${args.field} for you.`,
          fail: 'I was unable to find your seller with that ID.'
        });
      }
    },

    inventory: {
      usage: 'seller inventory [name]',
      description: 'Lists the inventory of a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return db.run({
          query: `SELECT listings.id, listings.item, listings.price, sellers.name
                  FROM listings
                  INNER JOIN sellers on sellers.id = listings.sellerId
                  WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                  OR sellers.id = "${args.sellerName}"`,
          success: "Here's what I found",
          fail: "That seller either doesn't exist or has no listings yet."
        });
      }
    },

    info: {
      usage: 'seller info [name|id]',
      description: 'Shows information about a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return new Promise((resolve, reject) => {
          db.get({
            query: `SELECT sellers.*, users.name AS "owner"
                    FROM sellers
                    LEFT JOIN users ON users.id = sellers.userId
                    WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                    OR sellers.id = "${args.sellerName}"`
          }).then((seller) => {
            if (seller) {
              resolve({
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
              })
            } else {
              resolve({
                message: 'I was unable to find that seller.'
              });
            }
          }).catch(reason => {
            reject(reason);
          });
        });
      }
    },

    default: {
      usage: 'seller default [id]',
      description: 'Sets a default seller for new listings',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        return db.get({
          query: `SELECT id FROM sellers WHERE id = ${args.sellerId} AND userId = ${user.id}`
        }).then(seller => {
          if (seller) return db.run({
            query: `UPDATE users
                    SET defaultSeller = ${seller.id}
                    WHERE id = ${user.id}`,
            success: "I've set that as your default seller.",
            fail: 'I was unable to set that as your default seller.'
          });

          return Promise.resolve({
            message: 'I was unable to find your seller by that ID.'
          });
        }).catch(reason => {
          return Promise.reject(reason);
        });
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
                  WHERE id = "${args.sellerId}"`,
          success: "I've toggled that seller for you",
          fail: 'I was unable to find your seller with that ID.'
        });
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
