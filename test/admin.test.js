const db = require('../db/config');
const adminCommand = require('../commands/admin');

let user;
let admin;
let nonAdmin;

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
  user = await db('users').first();
  admin = await db('users').where({ admin: 1 }).first();
  nonAdmin = await db('users').where({ admin: 0 }).first();
});

test('Toggle admin on for user', async () => {
  const args = {
    discordId: nonAdmin.discordId
  };

  await adminCommand.subCommands.toggle.execute(args).then(result => {
    expect(result.success).toBe(true);
  });

  await db('users').where({ id: nonAdmin.id }).first().then(user => {
    expect(user.admin).toBe(1);
  });
});

test('Toggle admin off for user', async () => {
  const args = {
    discordId: admin.discordId
  };

  await adminCommand.subCommands.toggle.execute(args).then(result => {
    expect(result.success).toBe(true);
  });

  await db('users').where({ id: admin.id }).first().then(user => {
    expect(user.admin).toBe(0);
  });
});

test('toggle admin - invalid ID', async () => {
  const args = {
    discordId: '1234'
  };

  await adminCommand.subCommands.toggle.execute(args).then(result => {
    expect(result.message).toBe('I was unable to find a user using that Discord ID.');
  });
});

test('purge user', async () => {
  const args = {
    discordId: user.discordId
  };

  await adminCommand.subCommands.purge.execute(args).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ userId: user.id }).then(sellers => {
    expect(sellers.length).toBe(0);
  });

  await db('listings').where({ userId: user.id }).then(listings => {
    expect(listings.length).toBe(0);
  });
});

test('purge user - invalid user', async () => {
  const args = {
    discordId: '1234'
  };

  await adminCommand.subCommands.purge.execute(args).then(result => {
    expect(result.message).toBe('I was unable to find a user using that Discord ID.');
  });
});
