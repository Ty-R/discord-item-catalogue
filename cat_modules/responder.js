const subCommandsFormatter = require('./help_formatting');

module.exports = {
  segmentedResponse(responseMessage) {
    const segments = [];
    let currentMessage = '';
    messageLines = responseMessage.split("\n");
  
    messageLines.forEach(line => {
      line 
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
    const formattedsubCommands = subCommandsFormatter.run(subCommands);
    channel.send(`\`\`\`${formattedsubCommands}\`\`\``);
  }
}
