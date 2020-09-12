const db = require("../db/config")
const seller = require('../commands/seller')

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
})

test("list sellers", async () => {
  const message = await seller.subCommands.list.execute();
  expect(message.success).toBe(true);
});

test("add seller", async () => {
  const user = await db('users').first();
  const args = { sellerName: 'My Shop' };
  const message = await seller.subCommands.add.execute(args, user);

  expect(message.success).toBe(true);

  const result = await db('sellers').where({ name: 'My Shop' }).first();

  expect(result.userId).toBe(user.id);
});

test("Remove seller", async () => {
  const testSeller = await db('sellers').first();
  const user = await db('users').where({ id: testSeller.userId }).first();
  const args = { sellerId: testSeller.id };
  const message = await seller.subCommands.remove.execute(args, user);

  expect(message.success).toBe(true);

  const result = await db('sellers').where({ id: testSeller.id });

  expect(result.length).toBe(0);
});

test("Update seller - name", async () => {
  const testSeller = await db('sellers').first();
  const user = await db('users').where({ id: testSeller.userId }).first();
  const args = { sellerId: testSeller.id, field: 'name', value: 'Updated seller name' };
  const message = await seller.subCommands.update.execute(args, user);

  expect(message.success).toBe(true);

  const result = await db('sellers').where({ id: testSeller.id }).first();

  expect(result.name).toBe('Updated seller name');
});

test("Clear field - location", async () => {
  const testSeller = await db('sellers').whereNot({ location: null }).first();
  const user = await db('users').where({ id: testSeller.userId }).first();
  const args = { sellerId: testSeller.id, field: 'location' };
  const message = await seller.subCommands.clear.execute(args, user);

  expect(message.success).toBe(true);

  const result = await db('sellers').where({ id: testSeller.id }).first();
  expect(result.location).toBe(null);
});

test("Seller inventory", async () => {
  const testSeller = await db('sellers').first();
  const args = { sellerName: testSeller.id };
  const message = await seller.subCommands.inventory.execute(args);

  expect(message.success).toBe(true);
});

test("Seller default", async () => {
  const testSeller = await db('sellers').first();
  let user = await db('users').where({ id: testSeller.userId }).first();
  const args = { sellerId: testSeller.id };
  
  const result = await seller.subCommands.default.execute(args, user);

  expect(result.success).toBe(true);

  user = await db('users').where({ id: user.id }).first();

  expect(user.defaultSeller).toBe(testSeller.id);;
});