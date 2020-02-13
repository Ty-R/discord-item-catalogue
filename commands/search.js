module.exports = {
  name: 'search',
  usage: 'search [option] [search term]',
  execute(args) {
    const fieldFromFlag = require('../cat_modules/field_from_flag');
    const db = require('../cat_modules/db').load();

    const field = fieldFromFlag.run(args.flag);
    
    let sql = `SELECT listings.*, users.name 
               FROM listings
               INNER JOIN users on users.id = listings.userId
               WHERE LOWER(${field})
               LIKE LOWER("%${args.primary.replace('*', '')}%")` 
 
    function resultMessage(result) {
      const details = `[**id:** ${result.id}, **owner:** ${result.name}] `;
      let response = `**${result.location || result.name}** is selling **${result.item}** for **${result.price}**`;

      if (verbose()) {
        response = details + response;
      }

      return `• ${response}`;
    }

    function verbose() {
      return (args.flag && args.flag.includes('v'));
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
            message: `That ${field} search returned no results.`
          });
        }
      });
    });
  },

  valid(args) {
    return !!args.primary;
  }
}
