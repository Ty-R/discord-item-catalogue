const { prefix } = require('../config.json');

exports.run = (subCommands) => {
  const subCommandKeys = Object.keys(subCommands);

  const usages = subCommandKeys.map(subcmd => subCommands[subcmd].usage);
  const longest = usages.reduce((a, b) => a.length > b.length ? a : b).length;

  const helpEntries = subCommandKeys.map(function(cmd) {
    let subcmd = subCommands[cmd];
    let usage = subcmd.usage;
    let description = subcmd.description;
    let spacing = ' '.repeat((longest + 2) - usage.length);

    return `${prefix} ${usage} ${spacing} # ${description}`;
  });

  return helpEntries.join("\n");
}
