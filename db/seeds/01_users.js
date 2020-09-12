exports.seed = (knex) => {
  return knex('users').del().then(() => {
    return knex('users').insert([
      {
        id: 1,
        discordId: '1',
        name: 'user1'
      },
      {
        id: 2,
        discordId: '2',
        name: 'user2'
      },
      {
        id: 3,
        discordId: '3',
        name: 'user3'
      },
      {
        id: 4,
        discordId: '4',
        name: 'user4'
      },
      {
        id: 5,
        discordId: '5',
        name: 'user4'
      },
      {
        id: 6,
        discordId: '6',
        name: 'admin_user1',
        admin: 1
      }
    ]);
  });
};
