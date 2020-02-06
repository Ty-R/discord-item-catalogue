const add = require('../commands/add');
const sqlite = require('../cat_modules/db');
const dbFile = 'db/catalogue_test.db';

sqlite.connect(dbFile);
const db = sqlite.load();

beforeAll(() => {
  const sql = `INSERT INTO listings (seller, item, price, location)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, ['User', '1 book', '5 gold', 'plot 5']);
});

afterAll(() => {
  db.run('DELETE FROM listings');
});

describe('Adding', () => {
  const args = {
    user:   'User',
    action: 'add',
    secondary: '5 gold'
  }

  it('should allow a user to add a listing to the catalogue', () => {
    args.primary = '16 logs';
    return add.execute(args).then(result => expect(result.message).toMatch("I've added **16 logs** to the catalogue for you"));
  });

  it('should not allow adding duplicate listings', () => {
    args.primary = '1 book';
    return add.execute(args).then(result => expect(result.message).toMatch('You already have a **1 book** listing.'));
  });
});
