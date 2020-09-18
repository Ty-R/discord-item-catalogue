exports.seed = (knex) => {
  return knex('listings').del().then(() => {
    return knex('listings').insert([
      {
        id: 1,
        item: 'item1',
        price: 'price1',
        userId: 1,
        sellerId: 1
      },
      {
        id: 2,
        item: 'item2',
        price: 'price2',
        userId: 1,
        sellerId: 2
      },
      {
        id: 3,
        item: 'item3',
        price: 'price3',
        userId: 1,
        sellerId: 3
      }
    ]);
  });
};
