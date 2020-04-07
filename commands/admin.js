module.exports = {
  name: 'admin',
  adminLocked: true,
  subCommands: {
    add: {
      usage: 'admin add [Discord ID]',
    },
    remove: {
      usage: 'admin remove [Discord ID]',
    },
    purge: {
      usage: 'admin purge [Discord ID]',
    }
  }
}
