const db = require('../db/config');
const listingCommand = require('../commands/listing');

let user;
let seller;
let listings;

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
  user = await db('users').first();
  seller = await db('sellers').first();
  listings = await db('listings');
});

test('Add listing - with seller, no default', async () => {
  const args = {
    item: 'tc1',
    price: 'tc1',
    sellerName: seller.id
  };

  await listingCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ item: 'tc1' }).first().then(listing => {
    expect(listing.userId).toBe(user.id);
    expect(listing.sellerId).toBe(seller.id);
  });
});

test('Add listing - override default seller', async () => {
  await db('users').first().update({ defaultSeller: seller.id });

  const args = {
    item: 'tc2',
    price: 'tc2',
    sellerName: 2
  };

  await listingCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ item: 'tc2' }).first().then(listing => {
    expect(listing.userId).toBe(user.id);
    expect(listing.sellerId).toBe(2);
  });
});

test('Add listing - without seller, no default', async () => {
  const args = {
    item: 'tc3',
    price: 'tc3'
  };

  await listingCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.message).toBe("I don't know where to add that listing - no seller specified and no default seller set.");
  });
});

test('Add listing - invalid seller, no default', async () => {
  const args = {
    item: 'tc4',
    price: 'tc4',
    sellerName: '1234'
  };

  await listingCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.message).toBe("I was unable to find your seller with that ID.");
  });
});

test('Add listing - without seller, with default', async () => {
  await db('users').first().update({ defaultSeller: seller.id });
  user = await db('users').first();

  const args = {
    item: 'tc5',
    price: 'tc5'
  };

  await listingCommand.subCommands.add.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  })

  await db('listings').where({ item: 'tc5' }).first().then(listing => {
    expect(listing.userId).toBe(user.id);
    expect(listing.sellerId).toBe(seller.id);
  });
});

test('Remove single listing', async () => {
  const listing = listings[0];

  const args = {
    listingIds: `${listing.id}`
  };

  await listingCommand.subCommands.remove.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ id: listing.id }).first().then(listing => {
    expect(listing).toBeUndefined();
  });
});

test('Remove multiple listings', async () => {
  const listingIds = listings.map(listing => listing.id);

  const args = {
    listingIds: listingIds.join(', ')
  };

  await listingCommand.subCommands.remove.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').whereIn('id', listingIds).then(listings => {
    expect(listings.length).toBe(0);
  });
});

test('Remove listing - invalid ID', async () => {
  const args = {
    listingIds: '1234'
  };

  await listingCommand.subCommands.remove.execute(args, user).then(result => {
    expect(result.message).toBe('I was unable to find and of your listing with the IDs given.');
  });
});

test('Search listings - complete term', async () => {
  const args = {
    term: 'item1'
  };

  await listingCommand.subCommands.search.execute(args).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Search listings - partial term', async () => {
  const args = {
    term: 'ite'
  };

  await listingCommand.subCommands.search.execute(args).then(result => {
    expect(result.success).toBe(true);
  });
});

test('Search listings - 0 results', async () => {
  const args = {
    term: 'abc123'
  };

  await listingCommand.subCommands.search.execute(args).then(result => {
    expect(result.message).toBe(`I was unable to find any listing names containing "${args.term}"`);
  });
});

test('Update listing - item name', async () => {
  const listing = listings[0];

  const args = {
    listingIds: `${listing.id}`,
    field: 'item',
    value: 'item10'
  };

  await listingCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ id: listing.id }).first().then(listing => {
    expect(listing.item).toBe('item10');
  });
});

test('Update listing - item price', async () => {
  const listing = listings[0];

  const args = {
    listingIds: `${listing.id}`,
    field: 'price',
    value: '10 gold'
  };

  await listingCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ id: listing.id }).first().then(listing => {
    expect(listing.price).toBe('10 gold');
  });
});

test('Update multiple listings ', async () => {
  const listingIds = listings.map(listing => listing.id);

  const args = {
    listingIds: listingIds.join(', '),
    field: 'item',
    value: 'item10'
  };

  await listingCommand.subCommands.update.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').whereIn('id', listingIds).then(listings => {
    const allRenamed = listings.every(listing => listing.item === 'item10');
    expect(allRenamed).toBe(true);
  });
});

test('Move a listing ', async () => {
  const listing = listings[0];

  const args = {
    listingIds: `${listing.id}`,
    sellerId: 2
  };

  await listingCommand.subCommands.move.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').where({ id: listing.id }).first().then(listing => {
    expect(listing.sellerId).toBe(2);
  });
});

test('Move a listing - invalid seller ', async () => {
  const listing = listings[0];

  const args = {
    listingIds: `${listing.id}`,
    sellerId: 1234
  };

  await listingCommand.subCommands.move.execute(args, user).then(result => {
    expect(result.message).toBe('I was unable to find your seller with that ID.');
  });
});

test('Move a listing - invalid listing ', async () => {
  const args = {
    listingIds: '1234',
    sellerId: 2
  };

  await listingCommand.subCommands.move.execute(args, user).then(result => {
    expect(result.message).toBe('I was unable to find your listings with the IDs given.');
  });
});

test('Move multiple listings ', async () => {
  const listingIds = listings.map(listing => listing.id);

  const args = {
    listingIds: listingIds.join(', '),
    sellerId: 2
  };

  await listingCommand.subCommands.move.execute(args, user).then(result => {
    expect(result.success).toBe(true);
  });

  await db('listings').whereIn('id', listingIds).then(listings => {
    const allMoved = listings.every(listing => listing.sellerId === 2);
    expect(allMoved).toBe(true);
  });
});
