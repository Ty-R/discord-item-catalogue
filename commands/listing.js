const db = require('../cat_modules/db').load();
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
        return db.get({
          query: `SELECT id FROM sellers
                  WHERE userId = ${user.id}
                  AND id IN (${args.sellerName || null}, ${user.defaultSeller})
                  ORDER BY CASE
                    WHEN id = "${args.sellerName}" THEN 1
                    ELSE 2
                  END
                  LIMIT 1`
        }).then(seller => {
          if (seller) return db.run({
            query: `INSERT INTO listings (item, price, userId, sellerId)
                    VALUES ("${args.item}", "${args.price}", "${user.id}", "${seller.id}")`,
            success: "I've added that listing for you."
          });

          return Promise.resolve({
            message: 'I was unable to find a seller to add that listing to.'
          });
        }).catch(reason => {
          return Promise.reject(reason);
        })
      }
    },

    remove: {
      usage: 'listing remove [id]',
      description: 'Remove an existing listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)/,
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `${id}`);
        let query = `DELETE FROM listings
                     WHERE id IN (${ids})`;

        if (!user.admin) query = query + ` AND userId = "${user.id}"`;

        return new Promise((resolve, reject) => {
          db.run(query, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "I've done that for you."
              });
            } else {
              resolve({
                message: "I was unable to find any of your sellers with the IDs given."
              });
            }
          });
        });
      }
    },

    search: {
      usage: 'listing search [term]',
      description: 'Search for a listing by item or seller',
      argsPattern: /(?<term>.+)/,
      execute(args) {
        const term = `%${args.term.replace('*', '')}%`;
        const sql = `SELECT listings.id, listings.item, listings.price, sellers.name, sellers.active
                     FROM listings
                     INNER JOIN sellers on sellers.id = listings.sellerId
                     WHERE sellers.active = 1
                     AND LOWER("item") LIKE LOWER("${term}")
                     LIMIT ${searchCap}`

        return db.all(sql, 'listings');
      }
    },

    update: {
      usage: 'listing update [id] [field]:[value]',
      description: 'Update the item, price, or seller of a listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)\s(?<field>item|price|seller)\s*:\s*(?<value>.+)/,
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        const errOnFail1 = "I couldn't find any listings that belong to you with the IDs given."

        if (args.field === 'seller') {
          const errOnFail2 = `I couldn't find a seller named "${args.value}" that belongs to you.`;
          return db.get(`SELECT id FROM sellers WHERE LOWER(name) = LOWER("${args.value}") AND userId = "${user.id}"`, errOnFail2).then(result => {
            if (result.success === false) return result;
            return db.run(`UPDATE listings
                           SET "sellerId" = "${result.id}"
                           WHERE id in (${ids})
                           AND userId = "${user.id}"`, errOnFail1);
          });
        }

        return db.run(
          `UPDATE listings
           SET "${args.field}" = "${args.value}"
           WHERE id in (${ids})
           AND userId = "${user.id}"`, errOnFail1
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
