const db = require('../cat_modules/db_query');

module.exports = {
  name: 'listing',
  subCommands: {
    add: {
      usage: 'listing add [item]:[price] @[seller name]',
      description: 'Add a new listing',
      argsPattern: "(?<item>[^:]+\\b)\\s?:\\s?(?<price>[^@]+)\\s+@(?<sellerName>.+)",
      execute(args, user) {
        return db.get(`SELECT id FROM sellers WHERE LOWER(name) = LOWER("${args.sellerName}") AND userId = "${user.id}"`).then(result => {
          if (result.success === false) return result;
          if (!result) return Promise.resolve({ message: "You don't have a seller by that name, are you sure it's correct?" })
          return db.run(
            `INSERT INTO listings (item, price, sellerId, userId)
             VALUES ("${args.item}", "${args.price}", "${result.id}", "${user.id}")`
          );
        })
      }
    },

    remove: {
      usage: 'listing remove [listing ID]',
      description: 'Remove an existing listing',
      argsPattern: "(?<listingIds>[0-9,\\s]+)",
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        let sql = `DELETE FROM listings
                   WHERE id in (${ids})`;
        
        if (!user.admin) sql = sql + ` AND userId = "${user.id}"`;
        const errOnFail = "I couldn't find any listings that belonged to you with the IDs given."
        return db.run(sql, errOnFail);
      }
    },

    search: {
      usage: 'listing search [term]',
      description: 'Search for a listing by item or seller',
      argsPattern: "(?<term>.+)",
      execute(args) {
        const term = `%${args.term.replace('*', '')}%`;
        const sql = `SELECT listings.id, listings.item, listings.price, sellers.name
                     FROM listings
                     INNER JOIN sellers on sellers.id = listings.sellerId
                     WHERE LOWER("item") LIKE LOWER("${term}")
                       OR LOWER("name") LIKE LOWER("${term}")
                     LIMIT 10;
                     ORDER BY
                     CASE
                       WHEN LOWER("item") LIKE '${term}' THEN 1
                       WHEN LOWER("name") LIKE '${term}' THEN 2
                       ELSE 3
                     END`

        return db.all(sql, 'listings');
      }
    },

    update: {
      usage: 'listing update [listing IDs] [field]:[value]',
      description: 'Update a listing',
      argsPattern: "(?<listingIds>[0-9,\\s]+)\\s(?<field>item|price|seller)\\s?:\\s?(?<value>.+)",
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        const errOnFail = "I couldn't find any listings that belonged to you with the IDs given."

        if (args.field === 'seller') {
          return db.get(`SELECT id FROM sellers WHERE LOWER(name) = LOWER("${args.value}") AND userId = "${user.id}"`).then(seller => {
            if (!seller) return Promise.resolve({ message: "You don't have a seller by that name, are you sure it's correct?" });
            return db.run(`UPDATE listings
                           SET "sellerId" = "${seller.id}"
                           WHERE id in (${ids})
                           AND userId = "${user.id}"`, errOnFail);
          });
        }

        return db.run(
          `UPDATE listings
           SET "${args.field}" = "${args.value}"
           WHERE id in (${ids})
           AND userId = "${user.id}"`, errOnFail
        );
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
