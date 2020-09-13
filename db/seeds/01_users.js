exports.seed = (knex) => {
  return knex('users').del().then(() => {
    return knex('users').insert([
      {
        id: 1,
        discordId: '1',
        name: 'user',
        admin: 0
      },
      {
        id: 2,
        discordId: '2',
        name: 'admin_user',
        admin: 1
      }
    ]);
  });
};
