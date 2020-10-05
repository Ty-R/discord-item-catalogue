const db = require('../db/config');
const sellerCommand = require('../commands/seller');

let user;
let seller;

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
  user = await db('users').first();
  seller = await db('sellers').first();
});

test('List sellers', async () => {
  sellerCommand.subCommands.list.execute().then(result => {
    expect(result.success).toBe(true);
  });
});

test('Add seller', async () => {
  const args = {
    sellerName: 'My Shop'
  };

  await sellerCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ name: 'My Shop' }).first().then(seller => {
    expect(seller.userId).toBe(user.id);
  });
});

test('Remove seller', async () => {
  const args = {
    sellerId: seller.id
  };

  await sellerCommand.subCommands.remove.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).then(sellers => {
    expect(sellers.length).toBe(0);
  });
});

test('Update seller - name', async () => {
  const args = {
    sellerId: seller.id,
    field: 'name',
    value: 'Updated seller name'
  };

  await sellerCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.name).toBe('Updated seller name');
  });
});

test('Update seller - location', async () => {
  const args = {
    sellerId: seller.id,
    field: 'location',
    value: 'Updated seller location'
  };

  await sellerCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.location).toBe('Updated seller location');
  });
});

test('Update seller - description', async () => {
  const args = {
    sellerId: seller.id,
    field: 'description',
    value: 'Updated seller description'
  };

  await sellerCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.description).toBe('Updated seller description');
  });
});

test('Clear field - location', async () => {
  seller = await db('sellers').whereNot({ location: null }).first();

  const args = {
    sellerId: seller.id,
    field: 'location'
  };

  await sellerCommand.subCommands.clear.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.location).toBe(null);
  });
});

test('Clear field - description', async () => {
  seller = await db('sellers').whereNot({ description: null }).first();

  const args = {
    sellerId: seller.id,
    field: 'description'
  };

  await sellerCommand.subCommands.clear.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.description).toBe(null);
  });
});

test('Seller inventory by id', async () => {
  const args = {
    sellerName: seller.id
  };

  await sellerCommand.subCommands.inventory.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Seller inventory by name', async () => {
  const args = {
    sellerName: seller.name
  };

  await sellerCommand.subCommands.inventory.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Seller default', async () => {
  const args = {
    sellerId: seller.id
  };

  await sellerCommand.subCommands.default.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('users').where({ id: user.id }).first().then(user => {
    expect(user.defaultSeller).toBe(seller.id);
  });
});

test('Change seller owner', async () => {
  const args = {
    sellerId: seller.id,
    discordId: '2'
  };

  await sellerCommand.subCommands.owner.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('sellers').where({ id: seller.id }).first().then(seller => {
    expect(seller.userId).toBe(2);
  });
});

test('Change seller owner - invalid owner', async () => {
  const args = {
    sellerId: seller.id,
    discordId: '5'
  };

  await sellerCommand.subCommands.owner.execute(args, user).then(result => {
    expect(result.message).toBe("I can't find a user with that Discord ID.");
  });
});

test('Change seller owner - invalid seller', async () => {
  const args = {
    sellerId: 5,
    discordId: '2'
  };

  await sellerCommand.subCommands.owner.execute(args, user).then(result => {
    expect(result.message).toBe('I was unable to find your seller by that ID.');
  });
});
