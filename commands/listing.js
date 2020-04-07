const db = require('../cat_modules/db').load();

module.exports = {
  name: 'listing',
  subCommands: {
    add: {
      argsPattern: "(?<item>[^:]*):(?<price>[^:]*)",
      usage: 'listing add [item]:[price]',
  
      execute(args, user) {
        const sql = `INSERT INTO listings (item, price, userId)
                     VALUES (?, ?, ?)`;

        return new Promise((resolve, reject) => {
          db.run(sql, [args.item, args.price, user.id], function(err) {
            if (err) reject(err);
            resolve({ 
              success: true,
              message: `I've added **${args.item}** to the catalogue for you with an listing ID of **${this.lastID}**.`
            });
          });
        });
      }
    },

    remove: {
      argsPattern: "(?<listingIds>[0-9\\,]+)",
      usage: 'listing remove [listing ID]',

      execute(args, user) {
        const ids = args.listingIDs.split(',').map(id => `"${id}"`);
        const sql = `DELETE FROM listings
                     WHERE id in (${ids})
                     AND userId = "${user.id}"`;
    
        return new Promise((resolve, reject) => {
          db.run(sql, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That's all done for you."
              });
            } else {
              resolve({
                success: false,
                message: "I couldn't find any listings that belonged to you with the IDs given."
              });
            }
          });
        });
      }
    },

    search: {
      argsPattern: "(?<focus>(user|item|price|seller))\s?(?<term>.+)",
      usage: 'listing search <focus> [term]',

      execute(args) {
        const focus = args.focus || 'item'
    
        let sql = `SELECT listings.*, users.name 
                   FROM listings
                   INNER JOIN users on users.id = listings.userId
                   WHERE LOWER("${focus}")
                   LIKE LOWER("%${args.term.replace('*', '')}%")` 
     
        function resultMessage(result) {
          const details = `[**id:** ${result.id}, **owner:** ${result.name}] `;
          let response = `**${result.location || result.name}** is selling **${result.item}** for **${result.price}**`;
    
          if (verbose()) {
            response = details + response;
          }
    
          return `• ${response}`;
        }
    
        function verbose() {
          return true
          // return (args.flag && args.flag.includes('v'));
        }
    
        return new Promise((resolve, reject) => {
          db.all(sql, (err, listings) => {
            if (err) reject(err);
    
            if (listings.length > 0) {
              listings = listings.map((listing) => {
                return resultMessage(listing);
              }).join("\n");
    
              resolve({
                success: true,
                message: `Here's what I found:\n\n${listings}`
              });
            } else {
              resolve({
                success: false,
                message: `That ${focus} search returned no results.`
              });
            }
          });
        });
      }
    },

    update: {
      argsPattern: "",
      usage: 'listing update [listing IDs] [field]:[value]',

      execute(args, user) {
        const ids = args.listingIds.split(',').map(id => `"${id}"`);
        let sql = `UPDATE listings
                   SET ${args.focus} = ?
                   WHERE id in (${ids})
                   AND userId = "${user.id}"`;
    
        return new Promise((resolve, reject) => {
          db.run(sql, args.value, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That's all done for you."
              });
            } else {
              resolve({
                success: false,
                message: "I couldn't find any listings that belonged to you with the IDs given."
              });
            }
          });
        });
      }
    }
  }
}
