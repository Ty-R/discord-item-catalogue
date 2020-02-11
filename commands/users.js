module.exports = {
  name: 'users',
  adminLocked: true,
  usage: '!cat users',
  execute(args) {
    const db = require('../cat_modules/db').load();

    function formatUser(user) {
      return `• **id:** ${user.id}, **DiscordID:** ${user.discordId}, **name:** ${user.name}, **admin:** ${user.admin}`;
    }

    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', (err, users) => {
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
  },

  valid(args) {
    return true;
  }
}
