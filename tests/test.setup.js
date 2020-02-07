const sqlite = require('../cat_modules/db');
      sqlite.connect('db/catalogue_test.db');

const db = sqlite.load();

beforeAll(() => {
  const sql = `INSERT INTO listings (seller, item, price, location)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, ['User', '1 book', '5 gold', 'plot 5']);
  db.run(sql, ['User2', '2 candles', '1 gold', 'plot 1']);
});

afterAll(() => {
  db.run('DELETE FROM listings');
});
