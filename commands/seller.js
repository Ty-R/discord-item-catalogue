const db = require('../cat_modules/db').load();

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers',
      execute() {
        const query = `SELECT sellers.*, count(listings.id) AS listings
                       FROM sellers
                       LEFT JOIN listings ON listings.sellerID = sellers.id
                       GROUP BY sellers.id`

        return new Promise((resolve, reject) => {
          db.all(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length > 0) {
              resolve({
                success: true,
                message: `Here's what I found:\n\n${rows.map((row) => `• [${row.id}] ${row.name}`).join("\n")}`
              });
            } else {
              resolve({
                message: 'There are no sellers in the catalogue yet.'
              });
            }
          });
        });
      }
    },

    add: {
      usage: 'seller add [name]',
      description: 'Adds a new seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args, user) {
        const query = `INSERT INTO sellers (name, userId)
                       VALUES ("${args.sellerName}", ${user.id})`;

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That's all done for you."
              });
            } else {
              resolve({
                message: 'I was unable to add a seller by that name.'
              });
            }
          });
        });
      }
    },

    remove: {
      usage: 'seller remove [seller ID]',
      description: 'Removes a seller and any listings it holds',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        let query = `DELETE FROM sellers
                     WHERE id = ${args.sellerId}`;

        if (!user.admin) query = query + ` AND userId = "${user.id}"`;

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That seller, and any listings it had, have been removed from the catalogue."
              });
            } else {
              resolve({
                message: 'I was unable to find your seller with that ID.'
              });
            }
          });
        });
      }
    },

    update: {
      usage: 'seller update [seller ID] [field]:[value|unset]',
      description: 'Updates the field of a seller - name, location, icon, description',
      argsPattern: /(?<sellerId>[0-9]+)\s(?<field>name|location|icon|description)\s*:\s*(?<value>.+)/i,
      execute(args, user) {
        const field = args.field.toLowerCase();

        if (field === 'icon' && args.value === 'unset') args.value = null;

        let query = `UPDATE sellers
                     SET "${field}" = nullif("${args.value}", "null")
                     WHERE id = "${args.sellerId}"`

        if (!user.admin) query = query + ` AND userId = "${user.id}"`;

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: `I've updated that seller's ${args.field} for you.`
              });
            } else {
              resolve({
                message: 'I was unable to find your seller with that ID.'
              });
            }
          });
        });
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
                     WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                     OR sellers.id = "${args.sellerName}"`

        return new Promise((resolve, reject) => {
          db.all(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length > 0) {
              resolve({
                success: true,
                message: `Here's what I found:\n\n${rows.map((row) => `• [${row.id}] ${row.item} for ${row.price}`).join("\n")}`
              });
            } else {
              resolve({
                message: "That seller either doesn't exist or has no listings yet."
              });
            }
          });
        });
      }
    },

    info: {
      usage: 'seller info [seller name]',
      description: 'Shows information about a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        const query = `SELECT sellers.*, users.name AS "owner"
                       FROM sellers
                       LEFT JOIN users ON users.id = sellers.userId
                       WHERE LOWER(sellers.name) LIKE LOWER("${args.sellerName}%")
                       OR sellers.id = "${args.sellerName}"`;

        return new Promise((resolve, reject) => {
          db.get(query, (err, seller) => {
            if (err) reject(err);
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
              });
            } else {
              resolve({
                message: 'I was unable to find that seller.'
              });
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
        const query = `UPDATE users
                       SET defaultSeller = EXISTS (SELECT id FROM sellers WHERE id = ${args.sellerId} AND userId = ${user.id})
                       WHERE id = "${user.id}"`

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            if (err && !err.code.includes('SQLITE_CONSTRAINT')) reject(err);
            
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "I've set that as your default seller."
              });
            } else {
              resolve({
                message: 'I was unable to find your seller with that ID.'
              });
            }
          });
        });
      }
    },

    toggle: {
      usage: 'seller toggle [seller ID]',
      description: 'Toggle seller visibility',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        let query = `UPDATE sellers
                     SET active = NOT active
                     WHERE id = "${args.sellerId}"`

        if (!user.admin) query = query + ` AND userId = "${user.id}"`;

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            console.log(query)
            console.log(this)
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: `I've toggled that seller for you`
              });
            } else {
              resolve({
                message: 'I was unable to find your seller with that ID.'
              });
            }
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
