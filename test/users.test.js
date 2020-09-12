const db = require("../db/config")
const user = require('../commands/user')

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
})

test("list users", async () => {
  let message = await user.subCommands.list.execute();
  expect(message.success).toBe(true)
});
