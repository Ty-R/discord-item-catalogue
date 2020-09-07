const db = require('../cat_modules/db_query');
const { searchCap } = require('../config.json');

module.exports = {
  name: 'listing',
  description: "A listing is an item or service for a price. Listings belong to sellers",
  subCommands: {
    add: {
      usage: 'listing add [item]:[price] > [seller name]',
      description: 'Add a new listing',
      argsPattern: /(?<item>[^:]+[^\s])\s*:\s*(?<price>.+?)\s*(?=>\s*(?<sellerName>.+)|$)/,
      execute(args, user) {
        if (!args.sellerName && !user.defaultSeller) {
          return Promise.resolve({ message: "You need to specify a seller to add this listing to." });
        }

        const errOnFail = `You don't have a seller with that name. Has it been created? If not, you need to create it first using the \`seller\` command.`;
        const sql = `SELECT *
                     FROM sellers
                     WHERE userId = ${user.id}
                     AND LOWER(name) = LOWER("${args.sellerName}") OR id = ${user.defaultSeller}
                     ORDER BY CASE
                       WHEN LOWER(name) = LOWER("${args.sellerName}") THEN 1
                       ELSE 2
                     END
                     LIMIT 1`;

        return db.get(sql, errOnFail).then(result => {
          if (result.success === false) return result;
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
      argsPattern: /(?<listingIds>[0-9,\s]+)/,
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        let sql = `DELETE FROM listings
                   WHERE id in (${ids})`;
        
        if (!user.admin) sql = sql + ` AND userId = "${user.id}"`;
        const errOnFail = "I couldn't find any listings that belong to you with the IDs given."
        return db.run(sql, errOnFail);
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
      usage: 'listing update [listing IDs] [field]:[value]',
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
