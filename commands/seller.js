const db = require('../cat_modules/db_query');

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers',
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
      description: 'Adds a new seller',
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
      description: 'Removes a seller',
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
      usage: 'seller update [seller ID] [field]:[value|unset]',
      description: 'Updates a seller',
      argsPattern: "(?<sellerId>[0-9]+)\\s(?<field>name|location|icon|description)\\s?:\\s?(?<value>.+)",
      execute(args, user) {
        const errOnFail = "I couldn't find a seller with that ID that belongs to you."
        if (args.field === 'icon' && args.value === 'unset') args.value = null;

        return db.run(
          `UPDATE sellers
           SET "${args.field}" = nullif("${args.value}", "null")
           WHERE id = "${args.sellerId}"
           AND userId = "${user.id}"`, errOnFail
        );
      }
    },

    inventory: {
      usage: 'seller inventory [seller name]',
      description: 'Lists the inventory of a seller',
      argsPattern: "(?<sellerName>.+)",
      execute(args) {

      }
    },

    info: {
      usage: 'seller info [seller name]',
      description: 'Shows information about a seller',
      argsPattern: "(?<sellerName>.+)",
      execute(args) {
        return db.get(`SELECT sellers.*, users.name AS "owner" FROM sellers LEFT JOIN users ON users.id = sellers.userId WHERE sellers.name = "${args.sellerName}"`).then(seller => {
          return db.getAll(`SELECT * from listings WHERE sellerId = "${seller.id}"`).then(listings => {
            return Promise.resolve({
              success: true,
              message: {
                "embed": {
                  "color": `${seller.colour || '3447003'}`,
                  "thumbnail": {
                    "url": `${seller.icon || ''}`
                  },
                  "fields": [
                    {
                      "name": "Name",
                      "value": `${seller.name}`
                    },
                    {
                      "name": "Location",
                      "value": `${seller.location || '--'}`
                    },
                    {
                      "name": `No. Listings`,
                      "value": Object.keys(listings).length
                    },
                    {
                      "name": "Owner",
                      "value": `${seller.owner}`
                    },
                    {
                      "name": `Description`,
                      "value": `${seller.description || '--'}`
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
