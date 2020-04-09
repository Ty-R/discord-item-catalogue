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
           VALUES (${args.item}, ${args.price}, ${user.id}, ${args.seller})`
        );
      }
    },

    remove: {
      usage: 'listing remove [listing ID]',
      description: 'Remove an existing listing',
      argsPattern: "(?<listingIds>[0-9,]+)",
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        let sql = `DELETE FROM listings
                   WHERE id in (${ids})`
        
        if (!user.admin) sql = sql + `AND userId = "${user.id}"`

        return db.run(sql);
      }
    },

    search: {
      usage: 'listing search [term]',
      description: 'Search for a listing',
      argsPattern: "(?<term>.+)",
      execute(args) {  
        return db.all(
          `SELECT listings.id, listings.item, listings.price, listings.location, users.name 
           FROM listings
           INNER JOIN users on users.id = listings.userId
           WHERE LOWER("item")
           LIKE LOWER("%${args.term.replace('*', '')}%")` , 'listings'
        );
      }
    },

    update: {
      usage: 'listing update [listing IDs] [field]:[value]',
      description: 'Update a listing',
      argsPattern: "",
      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        return db.run(
          `UPDATE listings
           SET ${args.focus} = ${args.value}
           WHERE id in (${ids})
           AND userId = "${user.id}"`
        );
      }
    },

    help: {
      usage: 'listing help',
      description: 'Shows this.',
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
