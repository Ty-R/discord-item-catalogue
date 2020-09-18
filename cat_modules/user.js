const db = require('../db/config');

module.exports = {
  findOrCreate(discordId, name) {
    return db('users').where('discordId', discordId).first().then(user => {
      if (user) return user;

      return db('users').insert({ discordId, name }).then(() => {
        return db('users').where('discordId', discordId).first().then(user => { 
          return user;
        });
      });
    });
  }
}
