module.exports = {
  name: 'search',
  usage: '!cat search [option] [item]',
  execute(args) {
    const fieldFromFlag = require('../cat_modules/field_from_flag');
    const pluralize = require('pluralize');
    const db = require('../cat_modules/db').load();

    const field = fieldFromFlag.run(args.flag);

    if (args.primary.startsWith('@')) {
      args.flag = 'l';
      args.primary = args.primary.substring(1);
    }

    const sql = `SELECT rowid, * FROM listings
                 WHERE LOWER(${field})
                 LIKE LOWER("%${args.primary.replace('*', '')}%")`

    function resultMessage(result) {
      const details = `[**id:** ${result.rowid}, **owner:** ${result.seller}] `;
      let response = `**${result.location || result.seller}** is selling **${result.item}** for **${result.price}**`;

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

        listings = listings.map((listing) => {
          return resultMessage(listing);
        });

        resolve({
          success: true,
          message: `That ${field} search returned ${pluralize('result', listings.length, true)} \n\n${listings.join("\n")}`
        });
      });
    });
  },

  valid(args) {
    return !!args.primary;
  }
}
