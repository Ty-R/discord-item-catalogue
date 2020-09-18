exports.up = async (knex) => {
  knex.schema.createTable("listings", (table) => {
    table.increments('id').primary();
    table.text('item');
    table.text('price');
    table.integer('userId');
    table.foreign('userId')
         .references('users.id')
         .onDelete('CASCADE');
    table.integer('sellerId');
    table.foreign('sellerId')
         .references('sellers.id')
         .onDelete('CASCADE');
  }).then(() => {
    return;
  });
};

exports.down = async (knex) => {
  knex.schema.dropTable("listings").then(() => {
    return;
  });
};
