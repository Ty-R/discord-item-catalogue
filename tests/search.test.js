const search = require('../commands/search');
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

describe('Searching', () => {
  const args = {
    user:   'Test User',
    userId: '123',
    action: 'search'
  };

  it('should return results if listings are found', () => {
    args.primary = 'book';
    return search.execute(args).then(result => expect(result.message).toMatch('That item search returned 1 result'));
  });

  it('should return no results if no listings are found', () => {
    args.primary = 'abc123';
    return search.execute(args).then(result => expect(result.message).toMatch('That item search returned 0 results'));
  });

  it('should return detailed results if -v is given', () => {
    args.primary = 'book';
    args.flag = 'v';
    return search.execute(args).then(result => expect(result.message).toMatch(/id:/));
  });

  it('should return item results if no flag is given', () => {
    args.primary = 'book';
    return search.execute(args).then(result => expect(result.message).toMatch(/That item search returned/));
  });

  it('should return user results if -u is given', () => {
    args.primary = 'book';
    args.flag = 'u';
    return search.execute(args).then(result => expect(result.message).toMatch(/That seller search returned/));
  });

  it('should return location results if -l is given', () => {
    args.primary = 'book';
    args.flag = 'l';
    return search.execute(args).then(result => expect(result.message).toMatch(/That location search returned/));
  });

  it('should return location results if -l is given', () => {
    args.primary = 'book';
    args.flag = 'l';
    return search.execute(args).then(result => expect(result.message).toMatch(/That location search returned/));
  });

  it('should return location listings if @ is given', () => {
    args.primary = '@plot 5';
    return search.execute(args).then(result => expect(result.message).toMatch(/That location search returned/));
  });
});
