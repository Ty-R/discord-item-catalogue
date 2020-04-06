module.exports = {
  name: 'users',
  adminLocked: true,
  requiredArgs: [],
  usage: 'users',
  execute(args) {
    const db = require('../cat_modules/db').load();

    function formatUser(user) {
      return `• **DiscordID:** ${user.discordId}, **admin:** ${!!user.admin}, **name:** ${user.name}, **listings:** ${user.listings}`;
    }

    const sql = `SELECT users.*, count(listings.id) AS listings
                 FROM users
                 LEFT JOIN listings ON listings.userId = users.id
                 GROUP BY users.id`

    return new Promise((resolve, reject) => {
      db.all(sql, (err, users) => {
        if (err) reject(err);

        users = users.map(user => {
          return formatUser(user);
        })

        resolve({
          success: true,
          message: `Here you go: \n\n${users.join("\n")}`
        });
      })
    });
  }
}
