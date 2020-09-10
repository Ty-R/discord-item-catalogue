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

    if (subCommand.argsPattern) {
      const args = input.args.match(subCommand.argsPattern);

      // Check if given args matched the expected args pattern
      if (!args) {
        return {
          message: `Here's how you use that \`${prefix} ${subCommand.usage}\`.`
        };
      }

      // Check if any of the arg groups contain a colon
      if (Object.values(args.groups).some(arg => arg && arg.includes(':'))) {
        return {
          message: 'The character "`:`" is reserved for internal use and cannot exist outside of the separator.'
        };
      }

      // All good
      return {
        success: true,
        args: args.groups,
        command: subCommand
      };
    }

    // All good
    return {
      success: true,
      command: subCommand
    };
  }

  // Sub-command expected but none given
  if (!input.subCommand && command.subCommands) {
    return {
      message: `You're missing the sub-command. See \`${prefix} ${command.name} help\` for usage information.`
    };
  }

  return {
    success: true,
    command
  };
}
