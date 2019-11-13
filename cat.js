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
      case 'search':
        reply(channelID, botSearchResults(searchCatalogue(args)));
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
  const newListing = {
    seller: user,
    item: args.item,
    quantity: args.quantity,
    price: args.price,
    location: args.location
  }

  catalogue.listings.push(newListing);
  updateLocalCatalogue();
}

function botSearchResults(results) {
  return [
    results.map(result => `\n • **${result.seller}** is selling **${result.quantity}** **${result.item}** for **${result.price}** at **${result.location}**`),
  ].join("\n");
}

function searchCatalogue(args) {
  let currentListings = catalogue.listings;
  if (args.seller) currentListings = currentListings.filter(e => e.seller === args.seller);
  if (args.item) currentListings = currentListings.filter(e => e.item === args.item);
  if (args.location) currentListings = currentListings.filter(e => e.location === args.location);
  return currentListings;
}

function helpCommands() {
  return [
    'To **add** an item to the catalogue: `!cat add [filters]`',
    'To **search** the catalogue: `!cat search [filters]`'
  ].join("\n");
}

function parseInput(message) {
  const parsedArgs = {};
  const knownArgs = ['item', 'quantity', 'price', 'location', 'seller'];
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
  return str.replace(/[^ \w]+/g, '').trim();
}