const db = require('../db/config');
const validator = require('../cat_modules/validator');
const discordClient = require('../cat_modules/setup_client');
const admin = require('../commands/admin');

const client = discordClient.run();

let adminUser;
let nonAdminUser;

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
  adminUser = await db('users').where({ admin: 1 }).first();
  nonAdminUser = await db('users').where({ admin: 0 }).first();
});

test('No command', async () => {
  const input = {};
  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/I don't understand that./);
  });
});

test('Non-admins rejected from admin commands', async () => {
  const input = {
    command: 'admin',
    subCommand:'help'
  };

  await validator.run(input, client.commands, nonAdminUser.admin).then(result => {
    expect(result.message).toMatch(/You don't have permission to use that command./);
  });
});

test('Admins can use admin commands', async () => {
  const input = {
    command: 'admin',
    subCommand:'help'
  };

  await validator.run(input, client.commands, adminUser.admin).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Invalid sub-command', async () => {
  const input = {
    command: 'listing',
    subCommand:'boop'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/I don't recognise that sub-command./);
  });
});

test('Missing sub-command', async () => {
  const input = {
    command: 'listing'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/You're missing the sub-command./);
  });
});

test('Reject args containing colon', async () => {
  const input = {
    command: 'listing',
    subCommand:'add',
    args:'ite:m : pr:ice > s:hop'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/The character "`:`" is reserved/);
  });
});

test('Valid args pattern - listing add', async () => {
  const input = {
    command: 'listing',
    subCommand:'add',
    args: 'item: price > 1'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Invalid args pattern - listing add', async () => {
  const input = {
    command: 'listing',
    subCommand:'add',
    args: 'item > 1'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/Here's how you use that/);
  });
});

test('Valid args pattern - listing remove', async () => {
  const input = {
    command: 'listing',
    subCommand:'remove',
    args: '1'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Invalid args pattern - listing remove', async () => {
  const input = {
    command: 'listing',
    subCommand:'remove',
    args: 'boop'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/Here's how you use that/);
  });
});

test('Valid args pattern - listing search', async () => {
  const input = {
    command: 'listing',
    subCommand:'search', args: 'item'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Valid args pattern - listing update', async () => {
  const input = {
    command: 'listing',
    subCommand:'update',
    args: '1 price: 5 gold'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Invalid args pattern - listing update', async () => {
  const input = {
    command: 'listing',
    subCommand:'update',
    args: 'price > 5 gold'
  };
  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/Here's how you use that/);
  });
});

test('Valid args pattern - listing move', async () => {
  const input = {
    command: 'listing',
    subCommand:'move',
    args: '1 > 2'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Invalid args pattern - listing move', async () => {
  const input = { 
    command: 'listing',
    subCommand:'move',
    args: 'boop'
  };

  await validator.run(input, client.commands).then(result => {
    expect(result.message).toMatch(/Here's how you use that/);
  });
});
