exports.up = async (knex) => {
  knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.text('discordId').unique();
    table.text('name');
    table.boolean('admin').defaultTo(0);
    table.integer('defaultSeller');
    table.foreign('defaultSeller')
         .references('sellers.id')
         .onDelete('SET NULL');
  }).then(() => {
    console.log("created users");
  });
};

exports.down = async (knex) => {
  knex.schema.dropTable('users').then(() => {
    console.log("dropped users");
  });
};
