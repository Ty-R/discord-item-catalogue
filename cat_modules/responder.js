const { prefix } = require('../config.json');

module.exports = {
  segmentedResponse(responseMessage) {
    const segments = [];
    let currentMessage = '';
    messageLines = responseMessage.split("\n");
  
    messageLines.forEach(line => {
      if ((currentMessage.length + line.length) <= 2000) {
        currentMessage = currentMessage + line + "\n";
      } else {
        segments.push(currentMessage);
        currentMessage = '';
      }
    });
  
    segments.push(currentMessage);
    return segments;
  },

  respond(channel, username, result) {
    const greeting = result.success ? `Hi, ${username}! ` : `Sorry, ${username}. `

    if (result.type === 'help') {
      return module.exports.respondWithHelp(channel, result.message);
    }

    if (typeof(result.message) === 'string') {
      result.message = greeting + result.message;
      module.exports.segmentedResponse(result.message).forEach(response => channel.send(response));
    } else {
      channel.send(result.message);
    }
  },

  respondWithHelp(channel, subCommands) {
    const filteredSubCommands = module.exports.filterSubCommands(subCommands)
    const formattedsubCommands = module.exports.formatSubCommandHelp(filteredSubCommands);
    channel.send(`\`\`\`${formattedsubCommands}\`\`\``);
  },

  formatSubCommandHelp(subCommands) {
    const subCommandKeys = Object.keys(subCommands);

    const usages = subCommandKeys.map(subcmd => subCommands[subcmd].usage);
    const longest = usages.reduce((a, b) => a.length > b.length ? a : b).length;
  
    const helpEntries = subCommandKeys.map(function(cmd) {
      let subcmd = subCommands[cmd];
      let spacing = ' '.repeat((longest + 2) - subcmd.usage.length);
  
      return `${prefix} ${subcmd.usage} ${spacing} # ${subcmd.description}`;
    });
  
    return helpEntries.join("\n");
  },

  filterSubCommands(subCommands) {
    Object.keys(subCommands).map(sc => { if (subCommands[sc].excludeFromHelp) delete subCommands[sc] });
    return subCommands;
  }
}
