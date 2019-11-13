const Discord = require('discord.io');
const auth = require('./auth.json');
const fs = require('fs');

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

const botUsername = 'Catalogue';
const catalogueFile = 'catalogue.json';
let catalogue;

if (!fs.existsSync(catalogueFile)) {
  fs.writeFile(catalogueFile, '{}', (err) => {
    if (err) {
      console.log(err);
      return;
    };
    catalogue = JSON.parse(fs.readFileSync(catalogueFile));
  });
} else {
  catalogue = JSON.parse(fs.readFileSync(catalogueFile))
}

bot.on('message', function (user, userID, channelID, message, evt) {
  if (message.includes('!cat') && user !== botUsername) {
    const action = message.split(' ', 2)[1];
    const args = parseInput(message);

    switch(action) {
      case 'add':
        addItemToCatalogue(user, args);
        reply(channelID, `Hi, ${user}! I've added **${toTitleCase(args.item)}** to the catalogue for you.`);
      break;
      default:
        reply(channelID, `Hi, ${user}! Here are the list of commands I understand: \n\n${helpCommands()}`)
    }
  }  
});

function reply(channelID, message) {
  bot.sendMessage({
    to: channelID,
    message: message
  });
}

function newUserCatalogue(user) {
  catalogue[user] = {inventory: []}
  return catalogue[user]
}

function updateLocalCatalogue() {
  fs.writeFile(catalogueFile, JSON.stringify(catalogue), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("Catalogue updated.");
  });
}

function addItemToCatalogue(user, args) {
  const userEntry = catalogue[user] || newUserCatalogue(user);
  userEntry.inventory.push({
    item: args.item,
    quantity: args.quantity,
    price: args.price,
    location: args.location
  });

  updateLocalCatalogue();
}

function helpCommands() {
  return [
    'To **add** an item to the catalogue: `!cat add item:[item] quantity:[quantity] price:[price] location:[location]`'
  ].join("\n");
}

function parseInput(message) {
  const parsedArgs = {};
  const knownArgs = ['item', 'quantity', 'price', 'location'];
  knownArgs.forEach(arg => {
    let match = message.match(`${arg}:\\s?(.*?)(?=(?:\\s\\w*:|$))`);
    if (match) parsedArgs[arg] = toSafeString(match[1]);
  })

  return parsedArgs;
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function toSafeString(str) {
  return str.replace(/[^ \w]+/g, '').trim().toLowerCase();
}
