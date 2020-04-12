exports.run = (message) => {
  // The responsibility of this is to take a command from a user
  // and return the command, the sub-command, and the remainder as formatted args.
  const args = message.content.match("\\s(?<command>[^\\s]*)\\s?(?<subCommand>[^\\s]*)\\s?(?<args>.*)")
  
  return args ? args.groups : {};
}
