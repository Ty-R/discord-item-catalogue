const path = require("path")

module.exports = {
  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "migrations")
    },
    seeds: {
      directory: path.join(__dirname, "seeds")
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  development: {
    client: "sqlite3",
    connection: {
      filename: './db/catalogue-dev.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "migrations")
    },
    seeds: {
      directory: path.join(__dirname, "seeds")
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    // debug: true
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: './db/catalogue.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "migrations")
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  }
};
