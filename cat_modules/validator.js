exports.run = (input, commands, userIsAmin) => {
  const { prefix } = require('../config.json');

  // Check command actually exists
  const command = commands.get(input.command);
  if (!command) {
    return {
      message: `I don't understand that. See \`${prefix} help\` for more usage information.`
    };
  }

  // Check if command is admin-locked
  if (command.adminLocked && !userIsAmin) {
    return {
      message: "You don't have permission to use that command."
    };
  }

  if (input.subCommand && command.subCommands) {
    // Check if given sub-command exists
    const subCommand = command.subCommands[input.subCommand];
    if (!subCommand) {
      return {
        message: `I don't recognise that sub-command. See \`${prefix} ${command.name} help\` for usage information.`
      };
    }

    // Check if sub-command matches the expected pattern
    const args = input.args.match(subCommand.argsPattern)
    if (!args) {
      return {
        message: `Here's how you use that \`${prefix} ${subCommand.usage}\`.`
      };
    }

    // All good
    return {
      success: true,
      args: args.groups,
      command: subCommand
    };
  }

  return {
    success: true,
    command
  };
}
