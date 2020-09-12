const db = require("../db/config")
const validator = require('../cat_modules/validator')
const discordClient = require('../cat_modules/setup_client');

const client = discordClient.run();

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

test("No command", async () => {
  const input = {};
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/I don't understand that./);
});

test("Non-admins rejected from admin commands", async () => {
  const user = db('users').where({ admin: 0 }).first();
  const input = { command: "admin", subCommand:"list" };
  const response = validator.run(input, client.commands, user.admin);

  expect(response.message).toBe("You don't have permission to use that command.");
});

test("Admins can use admin commands", async () => {
  const user = await db('users').where({ admin: 1 }).first();
  const input = { command: "admin", subCommand:"help" };
  const response = validator.run(input, client.commands, user.admin);

  expect(response.success).toBe(true);
});

test("Invalid sub-command", async () => {
  const input = { command: "listing", subCommand:"boop" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/I don't recognise that sub-command./);
});

test("Missing sub-command", async () => {
  const input = { command: "listing", subCommand:"" };;
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/You're missing the sub-command./);
});

test("Reject args containing colon", async () => {
  const input = { command: "listing", subCommand:"add", args: "ite:m : pr:ice > s:hop" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/The character "`:`" is reserved/);
});

test("Valid args pattern - listing add", async () => {
  const input = { command: "listing", subCommand:"add", args: "item: price > 1" };
  const response = validator.run(input, client.commands);

  expect(response.success).toBe(true);
});

test("Invalid args pattern - listing add", async () => {
  const input = { command: "listing", subCommand:"add", args: "item > 1" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/Here's how you use that/);
});

test("Valid args pattern - listing remove", async () => {
  const input = { command: "listing", subCommand:"remove", args: "1" };
  const response = validator.run(input, client.commands);

  expect(response.success).toBe(true);
});

test("Invalid args pattern - listing remove", async () => {
  const input = { command: "listing", subCommand:"remove", args: "boop" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/Here's how you use that/);
});

test("Valid args pattern - listing search", async () => {
  const input = { command: "listing", subCommand:"search", args: "item" };
  const response = validator.run(input, client.commands);

  expect(response.success).toBe(true);
});

test("Valid args pattern - listing update", async () => {
  const input = { command: "listing", subCommand:"update", args: "1 price: 5 gold" };
  const response = validator.run(input, client.commands);

  expect(response.success).toBe(true);
});

test("Invalid args pattern - listing update", async () => {
  const input = { command: "listing", subCommand:"update", args: "price > 5 gold" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/Here's how you use that/);
});

test("Valid args pattern - listing move", async () => {
  const input = { command: "listing", subCommand:"move", args: "1 > 2" };
  const response = validator.run(input, client.commands);

  expect(response.success).toBe(true);
});

test("Invalid args pattern - listing move", async () => {
  const input = { command: "listing", subCommand:"move", args: "boop" };
  const response = validator.run(input, client.commands);

  expect(response.message).toMatch(/Here's how you use that/);
});
