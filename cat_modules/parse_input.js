exports.run = (message) => {
  // Runs before anything else. Is used to split up the input into three groups:
  // * The command
  // * The sub-command
  // * The arguments
  // If the input matches, the groups will be passed into the "validator" for more
  // specific checks.
  const command = message.content.match(/\s+?(?<command>[^\s]+)\s*(?<subCommand>[^\s]*)\s*(?<args>.*)/);
  return command ? command.groups : {};
}
