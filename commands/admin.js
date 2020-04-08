module.exports = {
  name: 'admin',
  adminLocked: true,
  subCommands: {
    users: {
      usage: '',
      description: '',
      execute(args) {
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
    },
    add: {
      usage: 'admin add [Discord ID]',
      description: 'Make a user a catalogue admin.',
      execute(args) {
        let sql = `UPDATE users
                   SET admin = ?
                   WHERE discordId = "${args.discord_id}"`;

        return new Promise((resolve, reject) => {
          db.run(sql, '1', function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That's all done for you."
              });
            } else {
              resolve({
                success: false,
                message: 'No user was found with that Discord ID.'
              });
            }
          })
        })
      }
    },
    remove: {
      usage: 'admin remove [Discord ID]',
      description: 'Remove admin status from a user.',
      execute(args) {
        let sql = `UPDATE users
                   SET admin = ?
                   WHERE discordId = "${args.discord_id}"`;

        return new Promise((resolve, reject) => {
          db.run(sql, '0', function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: "That's all done for you."
              });
            } else {
              resolve({
                success: false,
                message: 'No user was found with that Discord ID.'
              });
            }
          })
        })
      }
    },
    purge: {
      usage: 'users purge [Discord ID]',
      description: 'Purge a user, and anything belonging to them, from the catalogue.',
      execute(args) {
        return new Promise((resolve, reject) => {
          db.run(`DELETE FROM users
                  WHERE discordId = "${args.discord_id}"`, function(err) {
            if (err) reject(err);
            if (this.changes > 0) {
              resolve({
                success: true,
                message: 'That user, and any listings belonging to that user, have been removed from the catalogue.'
              });
            } else {
              resolve({
                success: false,
                message: "I couldn't find a user in the catalogue with that ID, are you sure it's correct?"
              });
            }
          });
        });
      }
    },
    help: {
      usage: 'listing help',
      description: 'Shows this',
      execute() {
        return {
          success: true,
          type: 'help',
          message: module.exports.subCommands
        }
      }
    }
  }
}
