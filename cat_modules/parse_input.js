exports.run = (message) => {
  // We need to break apart the Discord input for later processing. We need:
  //  * The main command (help, listing, seller, etc.)
  //  * The sub-command (add, remove, search etc.)
  //  * Everything beyond - the args to the sub-command

  // The pattern below assumes a few things:
  //  * Sub-command may not be present
  //  * Command and sub-command will never contain spaces
  //  * Args are likely to contain spaces
  //  * More than one space may exist between command sections (e.g. <command>  <sub-command>   <args>)

  // cat_modules/validator.js performs the validations against the input groups
  // between presence of commands and the pattern of the args.
  // Expected arg patterns are defined in each sub-command (e.g. commands/admin.js)
  const command = message.content.match(/\s+?(?<command>[^\s]+)\s*(?<subCommand>[^\s]*)\s*(?<args>.*)/)
  return command ? command.groups : {};
}
