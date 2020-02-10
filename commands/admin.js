module.exports = {
  name: 'admin',
  adminLocked: true,
  usage: '!cat admin [option] [Discord ID]',
  execute(args) {
  },

  valid(args) {
    return !!args.flag && !!args.primary
  }
}
