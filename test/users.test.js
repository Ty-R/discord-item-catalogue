const db = require('../db/config');
const user = require('../commands/user');

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

test('List users', async () => {
  await user.subCommands.list.execute().then(result => {
    expect(result.success).toBe(true);
  });
});
