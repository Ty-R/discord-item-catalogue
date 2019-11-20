exports.run = (message) => {
  function toSafeString(str) {
    return str.replace(/[^ \w-]+/g, '').trim();
  }

  function tidyArgs(args) {
    Object.keys(args).forEach((key) => {
      if (args[key] == null) {
        delete args[key];
      } else {
        args[key] = toSafeString(args[key]);
      }
    });
  
    console.log(args);
    return args;
  }

  const args = {};

  const re = `!cat (add|search|update|remove|help)\\s?(\\-(.)\\s)?([^:@]*)(?::([^:@]*\\b)(?:\\s@(.*))?)?`;
  const matchedArgs = message.match(re);
  
  if (!matchedArgs) return args;

  args.action = matchedArgs[1];
  args.flag = matchedArgs[3]
  args.primary = matchedArgs[4];
  args.secondary = matchedArgs[5];
  args.optional = matchedArgs[6];

  return tidyArgs(args);
}
