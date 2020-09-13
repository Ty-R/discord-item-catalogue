exports.up = async (knex) => {
  knex.schema.createTable("sellers", (table) => {
    table.increments('id').primary();
    table.text('name').unique();
    table.text('location');
    table.text('icon');
    table.string('colour');
    table.text('description');
    table.boolean('active').defaultTo(1);
    table.integer('userId');
    table.foreign('userId')
         .references('users.id')
         .onDelete('CASCADE');
  }).then(() => {
    return;
  });
};

exports.down = async (knex) => {
  knex.schema.dropTable("sellers").then(() => {
    return;
  });
};
