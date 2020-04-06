module.exports = {
  name: 'search',
  requiredArgs: ['term'],
  usage: 'search [search term]',
  execute(args) {
    const db = require('../cat_modules/db').load();

    const focus = args.focus || 'item'
    
    let sql = `SELECT listings.*, users.name 
               FROM listings
               INNER JOIN users on users.id = listings.userId
               WHERE LOWER("${focus}")
               LIKE LOWER("%${args.term.replace('*', '')}%")` 

    console.log(sql)
 
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

        console.log(listings)
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
}
