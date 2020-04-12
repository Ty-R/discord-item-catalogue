const db = require('../cat_modules/db_query');

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers known to the catalogue',
      execute() {
        return db.all(
          `SELECT sellers.*, count(listings.id) AS listings
           FROM sellers
           LEFT JOIN listings ON listings.sellerID = sellers.id
           GROUP BY sellers.id`, 'sellers'
        );
      }
    },

    add: {
      usage: 'seller add [name]',
      description: 'Add a new seller',
      argsPattern: "(?<sellerName>.+)",
      execute(args, user) {
        return db.run(
          `INSERT INTO sellers (name, userId)
           VALUES ("${args.sellerName}", ${user.id})`
        );
      }
    },

    remove: {
      usage: 'seller remove [seller ID]',
      description: 'Remove a seller',
      argsPattern: "(?<sellerId>[0-9]+)",
      execute(args, user) {
        let sql = `DELETE FROM sellers
                   WHERE id in (${args.sellerId})`;
        
        if (!user.admin) sql = sql + ` AND userId = "${user.id}"`;
        const errOnFail = "I couldn't find a seller with that ID that belongs to you."
        return db.run(sql, errOnFail);
      }
    },

    update: {
      usage: 'seller update [seller ID] [field]:[value]',
      description: 'Update a seller',
      argsPattern: "(?<sellerId>[0-9]+)\\s(?<field>name|location|icon)\\s?:\\s?(?<value>.+)",
      execute(args, user) {
        const errOnFail = "I couldn't find a seller with that ID that belongs to you."
        return db.run(
          `UPDATE sellers
           SET "${args.field}" = "${args.value}"
           WHERE id = "${args.sellerId}"
           AND userId = "${user.id}"`, errOnFail
        );
      }
    },

    info: {
      usage: 'seller info [seller ID]',
      description: 'See information about the seller',
      argsPattern: "(?<sellerName>.+)",
      execute(args) {
        return db.get(`SELECT sellers.*, users.name AS "owner" FROM sellers LEFT JOIN users ON users.id = sellers.userId WHERE sellers.name = "${args.sellerName}"`).then(seller => {
          return db.getAll(`SELECT * from listings WHERE sellerId = "${seller.id}"`).then(listings => {
            return Promise.resolve({
              success: true,
              message: {
                "embed": {
                  "color":3447003,
                  "thumbnail": {
                    "url": `${seller.icon || ''}`
                  },
                  "fields": [
                    {
                      "name": "Name",
                      "value": `${seller.name}`,
                      "inline": true
                    },
                    {
                      "name": "Location",
                      "value": `${seller.location || '--'}`,
                      "inline": true
                    },
                    {
                      "name": "Owner",
                      "value": `${seller.owner}`,
                    },
                    {
                      "name": `Listings (${Object.keys(listings).length})`,
                      "value": listings.map((listing) => `${listing.item} for ${listing.price}`).join("\n") || 'No listings'
                    }
                  ]
                }
              }
            });
          });
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
