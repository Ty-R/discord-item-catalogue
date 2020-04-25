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
      argsPattern: /(?<sellerName>.+)/,
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
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        let sql = `DELETE FROM sellers
                   WHERE id = ${args.sellerId}`;
        
        if (!user.admin) sql = sql + ` AND userId = "${user.id}"`;

        return db.getAll(`SELECT * from listings WHERE sellerId = "${args.sellerId}"`).then(listings => {
          if (listings.length) {
            return Promise.resolve({message: "This seller has listings and cannot be removed. Either remove the listings or move them to another seller."});
          }
          const errOnFail = "I couldn't find a seller with that ID that belongs to you."
          return db.run(sql, errOnFail);
        });
      }
    },

    update: {
      usage: 'seller update [seller ID] [field]:[value|unset]',
      description: 'Updates the field of a seller - name, location, icon, description',
      argsPattern: /(?<sellerId>[0-9]+)\s(?<field>name|location|icon|description)\s*:\s*(?<value>.+)/,
      execute(args, user) {
        const errOnFail = "I couldn't find any sellers that belong to you with the ID given."
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
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        const sql = `SELECT listings.id, listings.item, listings.price, sellers.name
                     FROM listings
                     INNER JOIN sellers on sellers.id = listings.sellerId
                     WHERE LOWER(name) = LOWER("${args.sellerName}")`

        return db.all(sql, 'inventory');
      }
    },

    info: {
      usage: 'seller info [seller name]',
      description: 'Shows information about a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        const sql = `SELECT sellers.*, users.name AS "owner"
                     FROM sellers
                     LEFT JOIN users ON users.id = sellers.userId
                     WHERE LOWER(sellers.name) = LOWER("${args.sellerName}")`;

        const errOnFail = "I couldn't find a seller by that name."
        return db.get(sql, errOnFail).then(result => {
          if (result.success === false) return result;
          return Promise.resolve({
            success: true,
            message: {
              "embed": {
                "color": `${result.colour || '3447003'}`,
                "thumbnail": {
                  "url": `${result.icon || ''}`
                },
                "fields": [
                  {
                    "name": "ID",
                    "value": `${result.id}`,
                    'inline': true,
                  },
                  {
                    "name": "Name",
                    "value": `${result.name}`,
                    'inline': true,
                  },
                  {
                    "name": "Location",
                    "value": `${result.location || '--'}`
                  },
                  {
                    "name": "Owner",
                    "value": `${result.owner}`
                  },
                  {
                    "name": `Description`,
                    "value": `${result.description || '--'}`
                  }
                ]
              }
            }
          });
        });
      }
    },

    default: {
      usage: 'seller default [seller ID]',
      description: 'Sets a default seller for new listings',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        const errOnFail = `I couldn't find a seller with that ID that belongs to you.`
        return db.get(`SELECT id FROM sellers WHERE id = ${args.sellerId} AND userId = "${user.id}"`, errOnFail).then(result => {
          if (result.success === false) return result;
          return db.run(
            `UPDATE users
             SET defaultSeller = ${result.id}
             WHERE id = "${user.id}"`, errOnFail
          );
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
