exports.run = (args, subCommand) => {
  // The responsibility of this is to take formatted args and a command
  // and check if sub-command requirements are met

  return !!args.match(subCommand.argsPattern)
}
