const db = require('./db').load();

module.exports = {
  run(args) {
    return new Promise((resolve, reject) => {
      db.run(args.query, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: args.success
          });
        } else {
          resolve({
            message: args.fail
          });
        }
      });
    });
  },

  all(args) {
    return new Promise((resolve, reject) => {
      db.all(args.query, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  },

  get(args) {
    return new Promise((resolve, reject) => {
      db.get(args.query, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  // getAll(args) {
  //   return new Promise((resolve, reject) => {
  //     db.get(args.query, (err, row) => {
  //       if (err) reject(err);
  //       if (row) {
  //         resolve(row);
  //       } else {
  //         resolve({
  //           message: args.fail
  //         });
  //       }
  //     });
  //   });
  // },

  // getAll(sql) {
  //   return new Promise((resolve, reject) => {
  //     db.all(sql, (err, rows)=>{
  //       if (err) reject(err);
  //       resolve(rows);
  //     });
  //   });
  // },

  formats: {
    users: {
      format(rows) {
        return rows.map((row) => {
          return `• [${row.discordId}] ${row.name}`;
        }).join("\n");
      }
    },
    sellers: {
      format(rows) {
        return rows.map((row) => {
          return `• [${row.id}] ${row.name}`;
        }).join("\n");
      }
    },
    listings: {
      format(rows) {
        return rows.map((row) => {
          return `• [${row.id}]  **${row.name}** is selling **${row.item}** for **${row.price}**`;
        }).join("\n");
      }
    },
    inventory: {
      format(rows) {
        return rows.map((row) => {
          return `• [${row.id}] ${row.item} for ${row.price}`;
        }).join("\n");
      }
    },
    profile: {
      format(args) {
        return {

        }
      }
    }
  },
}