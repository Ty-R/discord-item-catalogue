
module.exports = {
  name: 'help',
  execute(message, catalogue, args) {
    message.author.send({
      "content": "Here's some basic information about me",
      "embed": {
        "description":"Catalogue is a bot designed to make it easier to keep track of who is selling what. It allows sellers to add listings, and buyers to query them. Click [here](https://github.com/TyRoberts/discord-item-catalogue#discord-catalogue-bot) for more information on usage.",
        "color":3447003,
        "thumbnail": {
          "url": "https://gamepedia.cursecdn.com/minecraft_gamepedia/8/85/Knowledge_book.png?version=0c9d97dd48215c6faa9e4513f5d87aa8"
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