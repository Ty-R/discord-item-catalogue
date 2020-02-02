module.exports = {
  name: 'help',
  execute(message, catalogue, args) {
    const description = require('../help.json');

    message.channel.send(description);
  },

  valid(args) {
    return true;
  }
}
