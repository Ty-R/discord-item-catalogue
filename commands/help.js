
module.exports = {
  name: 'help',
  execute(message, catalogue, args) {
    const { helpIcon } = require('../config.json');

    message.channel.send({
      "content": "Here's some basic information about me",
      "embed": {
        "description":"Catalogue is a bot designed to make it easier to keep track of who is selling what. It allows sellers to add listings, and buyers to query them. Click [here](https://github.com/TyRoberts/discord-item-catalogue#discord-catalogue-bot) for more information on usage.",
        "color":3447003,
        "thumbnail": {
          "url": helpIcon
        },
        "fields": [
          {
            "name": "Example: Adding an item to the catalogue",
            "value": "`!cat add 64 diamonds:64 iron @spawn`"
          },
          {
            "name": "Example: Removing an item in the catalogue",
            "value": "`!cat remove diamond`"
          },
          {
            "name": "Example: Searching the catalogue for an item",
            "value": "`!cat search diamond`"
          }
        ]
      }
    });
  },

  valid(args) {
    return true;
  }
}
