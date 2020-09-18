exports.seed = (knex) => {
  return knex('sellers').del().then(() => {
    return knex('sellers').insert([
      {
        id: 1,
        name: 'seller1',
        userId: 1,
        active: 1
      },
      {
        id: 2,
        name: 'seller2',
        userId: 1,
        active: 0
      },
      {
        id: 3,
        name: 'seller3',
        userId: 1,
        location: 'location',
        description: 'description',
        icon: 'icon',
        active: 1
      }
    ]);
  });
};
