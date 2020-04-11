const db = require('../cat_modules/db_query');

module.exports = {
  name: 'listing',
  subCommands: {
    add: {
      usage: 'listing add [item]:[price] @<seller>',
      description: 'Add a new listing',
      argsPattern: "(?<item>[^:]*\\b)\\s?:\\s?(?<price>[^@]+[^\\s@])(?:\\s@)?(?<seller>.*)",
      execute(args, user) {     
        return db.run(
          `INSERT INTO listings (item, price, userId, location)
           VALUES ("${args.item}", "${args.price}", ${user.id}, "${args.seller}")`
        );
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
      description: 'Search for a listing by item, location, or owner.',
      argsPattern: "(?<term>.+)",
      execute(args) {
        const term = `%${args.term.replace('*', '')}%`;
        const sql =           `SELECT listings.id, listings.item, listings.price, listings.location, users.name 
        FROM listings
        INNER JOIN users on users.id = listings.userId
        WHERE LOWER("item") LIKE LOWER("${term}")
           OR LOWER("location") LIKE LOWER("${term}")
           OR LOWER("name") LIKE LOWER("${term}")
        ORDER BY
        CASE
          WHEN LOWER("item") LIKE '${term}' THEN 1
          WHEN LOWER("location") LIKE '${term}' THEN 2
          WHEN LOWER("name") LIKE '${term}' THEN 3
          ELSE 4
        END`

        return db.all(sql, 'listings'
        );
      }
    },

    update: {
      usage: 'listing update [listing IDs] [field]:[value]',
      description: 'Update a listing',
      argsPattern: "(?<listingIds>[0-9,\\s]+)\\s(?<field>item|price|location)\\s?:\\s?(?<value>.+)",
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        const errOnFail = "I couldn't find any listings that belonged to you with the IDs given."
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
