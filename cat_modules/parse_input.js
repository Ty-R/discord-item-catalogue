exports.run = (message, commands) => {
  const logger = require('winston');
  function toSafeString(str) {
    return str.replace(/[^ \w-@*()\[\]_#,\.'’]+/g, '').trim();
  }

  function tidyArgs(args) {
    Object.keys(args).forEach((key) => {
      if (args[key] == null) {
        delete args[key];
      } else {
        args[key] = toSafeString(args[key]);
      }
    });
    logger.info(JSON.stringify(args));
    return args;
  }

  const args = {
    user: message.author.username,
    userId: message.author.id
  };

  const actions = commands.map(c => c.name);

  const re = `!cat (${actions.join('|')})\\s?(\\-(.\\w?)\\s)?([^:]*)(?::([^:@]*\\b)(?:\\s@(.*))?)?`;
  const matchedArgs = message.content.match(re);
  
  if (!matchedArgs) return args;

  args.action = matchedArgs[1];
  args.flag = matchedArgs[3]
  args.primary = matchedArgs[4];
  args.secondary = matchedArgs[5];
  args.optional = matchedArgs[6];

  return tidyArgs(args);
}
