const Discord = require('discord.io');
const auth = require('./auth.json');
const fs = require('fs');
const pluralize = require('pluralize');

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

const botUsername = 'Catalogue';
const catalogueFile = 'catalogue.json';
const writeActions = ['add', 'remove'];
let catalogue;

if (!fs.existsSync(catalogueFile)) {
  fs.writeFile(catalogueFile, '{"listings": []}', (err) => {
    if (err) {
      console.log(err);
      process.exit();
    };
    loadCatalogue();
  });
} else {
  loadCatalogue();
}

bot.on('message', function (user, userID, channelID, message, evt) {
  if (message.includes('!cat') && user !== botUsername) {
    const action = message.split(' ', 2)[1];
    const args = parseInput(message);

    if (action === 'help') {
      sendCustomHelpMessage(channelID);
      return;
    }

    if (writeActions.includes(action) && !args.item) {
      reply(channelID, `Calling \`${action}\` requires an item. See \`!cat help\` for more information `);
      return;
    }

    switch(action) {
      case 'add':
        reply(channelID, `Hi, ${user}! ${addItemToCatalogue(user, args)}`);
        break;
      case 'remove':
        reply(channelID, `Hi, ${user}! ${removeItemFromCatalogue(user, args)}`);
        break;
      case 'search':
        const { resultCount, results } = botSearchResults(searchCatalogue(args));
        reply(channelID, `Hi, ${user}! That query returned ${pluralize('result', resultCount, true)} \n\n${results}`);
        break;
      default:
        reply(channelID, "I don't understand that. See `!cat help` for more information");
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
    loadCatalogue();
  });
}

function addItemToCatalogue(user, args) {
  const existing = searchCatalogue({seller: user, item: args.item}).length > 0;

  if (existing) return `You're already have a **${args.item}** listing.`;
  createNewCatalogueEntry(user, args);
  return `I've added **${toTitleCase(args.item)}** to the catalogue for you`;
}

function createNewCatalogueEntry(user, args) {
  const newListing = {
    seller: user,
    quantity: args.quantity,
    item: args.item,
    price: args.price,
    location: args.location
  }

  catalogue.listings.push(newListing);
  updateLocalCatalogue();
}

function removeItemFromCatalogue(user, args) {
  const listing = searchCatalogue({seller: user, item: args.item})[0];
  if (listing) {
    deleteCatalogueEntry(listing);
    return `I've removed your **${args.item}** listing`;
  }

  return `I couldn't find a **${args.item}** that belongs to you.`;
}

function deleteCatalogueEntry(listing) {
  const index = catalogue.listings.indexOf(listing);
  catalogue.listings.splice(index, 1)
  updateLocalCatalogue();
}

function botSearchResults(results) {
  return {
    resultCount: results.length,
    results: results.map(result => resultMessage(result)).join("\n"),
  }
}

function resultMessage(result) {
  // Seller and item will be present in a result,
  // but the other args are optional, so we need,
  // to create a 'modular' message.
  const message = []

  Object.keys(result).forEach(arg => {
    switch(arg) {
      case 'seller':
        message.push(`• **${result.seller}** is selling`);
        break;
      case 'quantity':
        message.push(`**${result.quantity}**`);
        break;
      case 'item':
        message.push(`**${result.item}**`);
        break;
      case 'price':
        message.push(`for **${result.price}**`);
        break;
      case 'location':
        message.push(`at **${result.location}**`);
        break;
    }
  });

  return message.join(' ');
}

function searchCatalogue(args) {
  // When a search is done, we don't know which args will be passed in which order.
  // This is a weird solution but it allows for any combination of these args.
  let currentListings = catalogue.listings;
  if (args.seller) currentListings = currentListings.filter(e => e.seller === args.seller);
  if (args.item) currentListings = currentListings.filter(e => e.item === args.item);
  if (args.location) currentListings = currentListings.filter(e => e.location === args.location);
  return currentListings;
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
  return str.replace(/[^ \w]+/g, '').trim().toLowerCase();
}

function loadCatalogue() {
  catalogue = JSON.parse(fs.readFileSync(catalogueFile));
}

function sendCustomHelpMessage(channelID) {
  bot.sendMessage({
    to: channelID,
    message: "Here's some basic information about me",
    embed: {
      "description":"Catalogue is a bot designed to make it easier to keep track of what is being sold, by allowing users to _add_ items to it, and query existing items within it. Click [here](https://github.com/TyRoberts/discord-item-catalogue) for more information.",
      "color":3447003,
      "thumbnail": {
        "url": "https://gamepedia.cursecdn.com/minecraft_gamepedia/8/85/Knowledge_book.png?version=0c9d97dd48215c6faa9e4513f5d87aa8"
      },
      "fields": [
        {
          "name": "Example: Adding an item to the catalogue",
          "value": "`!cat add item: diamond`"
        },
        {
          "name": "Example: Removing an item in the catalogue",
          "value": "`!cat remove item: diamond`"
        },
        {
          "name": "Example: Searching for an item in the catalogue",
          "value": "`!cat search item: diamond`"
        }
      ]
    }
  });
}
