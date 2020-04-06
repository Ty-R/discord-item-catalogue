const sqlite = require('../cat_modules/db');
      sqlite.connect('db/catalogue_test.db');

const db = sqlite.load();

module.exports = {
   addUserByDiscordId(discordId) {
    const sql = `INSERT INTO users (discordId, name)
                 VALUES (?, ?)`;

    db.run(sql, [discordId, 'User']);  
  },

  addListing(userId) {
    const sql = `INSERT INTO listings (item, price, location, userId)
                 VALUES (?, ?, ?, ?)`;
    db.run(sql, ['1 book', '5 gold', 'plot 5', userId])
  },

  addListings(data) {
    return new Promise((resolve) => {
      for (let step = 0; step <= data.count; step++) {
        module.exports.addListing(data.userId)
      }
      resolve();
    })
  },

  async cleanDb() {
    await Promise.resolve(
      db.run('DELETE FROM users'),
      db.run('DELETE FROM listings')
    )
  }
}
