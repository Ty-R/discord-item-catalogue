const db = require('../cat_modules/db_query');

module.exports = {
  name: 'user',
  subCommands: {
    list: {
      usage: 'user list',
      description: 'Lists all users known to the catalogue.',
      execute() {
        return db.all(
          `SELECT users.*, count(listings.id) AS listings
          FROM users
          LEFT JOIN listings ON listings.userId = users.id
          GROUP BY users.id`, 'listings'
        );
      }
    },
  }
}
