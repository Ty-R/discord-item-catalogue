exports.run = async (discordId, name) => {
  const db = require('./db').load();
  const sql = `INSERT OR IGNORE INTO users (discordId, name)
               VALUES (?, ?)`;

  await db.run(sql, [discordId, name]);
};
