const db = require('../cat_modules/db_query');
const { searchCap } = require('../config.json');

module.exports = {
  name: 'listing',
  description: "A listing is an item or service for a price. Listings belong to sellers",
  subCommands: {
    add: {
      usage: 'listing add [item]:[price] > [seller id]',
      description: 'Add a new listing',
      argsPattern: /(?<item>[^:]+[^\s])\s*:\s*(?<price>.+?)\s*(?=>\s*(?<sellerName>.+)|$)/,
      execute(args, user) {
        const id = args.sellerName || user.defaultSeller;
        if (!id) return Promise.resolve({
          message: "I don't know where to add that listing - no seller specified and no default seller set."
        });

        return db.get({
          query: `SELECT * FROM sellers
                  WHERE userId = ${user.id}
                  AND id = ${id}`
        }).then(seller => {
          if (!seller) return {
            message: "I was unable to find your seller with that ID."
          }

          return db.run({
            query: `INSERT INTO listings (item, price, userId, sellerId)
                    VALUES ("${args.item}", "${args.price}", "${user.id}", "${seller.id}")`
          }).then(() => {
            return {
              success: true,
              message: `I've added that listing to "${seller.name}" for you.`
            }
          });
        }).catch(error => Promise.reject(error));
      }
    },

    remove: {
      usage: 'listing remove [id]',
      description: 'Remove an existing listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)/,
      execute(args, user) {
        return db.run({
          query: `DELETE FROM listings
                  WHERE id IN (${args.listingIds.split(',')})
                  ${user.admin ? '' : `AND userId = "${user.id}"`}`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: "Any of your listings matching the IDs given have been removed."
            } 
          } else {
            return {
              message: 'I was unable to find your listings with the IDs given.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },

    search: {
      usage: 'listing search [term]',
      description: 'Search for a listing by item or seller',
      argsPattern: /(?<term>.+)/,
      execute(args) {
        return db.all({
          query:`SELECT listings.id, listings.item, listings.price, sellers.name, sellers.active
                 FROM listings
                 INNER JOIN sellers on sellers.id = listings.sellerId
                 WHERE sellers.active = 1
                 AND LOWER("item") LIKE LOWER("%${args.term}%")
                 LIMIT ${searchCap}`
        }).then(listings => {
          if (listings.length > 0) {
            return {
              success: true,
              message: "Here's what I found:\n\n" + listings.map(row => `• [${row.id}]  **${row.name}** is selling **${row.item}** for **${row.price}**`).join("\n")
            };
          } else {
            return {
              message: `I was unable to find any listing names containing "${args.term}"`
            };
          };
        }).catch(error => Promise.reject(error));
      }
    },

    update: {
      usage: 'listing update [id] [field]:[value]',
      description: 'Update the item or price of a listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)\s(?<field>item|price)\s*:\s*(?<value>.+)/,
      execute(args, user) {
        return db.run({
          query: `UPDATE listings
                  SET "${args.field}" = "${args.value}"
                  WHERE id in (${args.listingIds.split(',')})
                  AND userId = "${user.id}"`
        }).then(result => {
          if (result.success) {
            return {
              success: true,
              message: "That's all done."
            }
          } else {
            return {
              message: 'I was unable to find your listings with the IDs given.'
            }
          }
        })
      }
    },

    move: {
      usage: 'listing move [id] > [seller id]',
      description: 'Move a listing to a different seller',
      argsPattern: /(?<listingIds>[0-9,\s]+)\s*>\s*(?<sellerId>.+)/,
      execute(args, user) {
        return db.get({
          query: `SELECT * FROM sellers
                  WHERE id = "${args.sellerId}"
                  AND userId = "${user.id}"`
        }).then(seller => {
          if (!seller) return {
            message: 'I was unable to find your seller with that ID.'
          }

          return db.run({
            query: `UPDATE listings
                    SET "sellerId" = "${seller.id}"
                    WHERE id in (${args.listingIds.split(',')})
                    AND userId = "${user.id}"`
          }).then(result => {
            if (result.success) {
              return {
                success: true,
                message: `I've moved any of your listings with those IDs to "${seller.name}"`
              }
            } else {
              return {
                message: 'I was unable to find your listings with the IDs given.'
              }
            }
          }).catch(error => Promise.reject(error));
        }).catch(error => Promise.reject(error));
      }
    },

    help: {
      usage: 'listing help',
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
