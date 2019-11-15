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
const writeActions = ['add', 'remove', 'update'];
let shoutedAt = false;
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
  // The user might accidently have caps on, we don't want this to
  // not reach the bot, but we could have some fun with it..
  if (message.includes('!CAT')) {
    shoutedAt = true;
    message = message.toLowerCase();
  }
  
  if (message.includes('!cat') && user !== botUsername) {
    const action = message.split(' ', 2)[1];
    const args = parseInput(message);

    user = user.toLowerCase();

    if (action === 'help') {
      sendCustomHelpMessage(channelID);
      return;
    }

    if (writeActions.includes(action) && !args.item) {
      reply(user, channelID, `Calling \`${action}\` requires an item. See \`!cat help\` for more information `);
      return;
    }

    switch(action) {
      case 'add':
        reply(user, channelID, addItemToCatalogue(user, args));
        break;
      case 'update':
        reply(user, channelID, updateItemInCatalogue(user, args));
        break;
      case 'remove':
        reply(user, channelID, removeItemFromCatalogue(user, args));
        break;
      case 'search':
        const { resultCount, results } = botSearchResults(searchCatalogue(args));
        reply(user, channelID, `That query returned ${pluralize('result', resultCount, true)} \n\n${results}`);
        break;
      default:
        reply(user, channelID, "I don't understand that. See `!cat help` for more information");
    }
  }
});

function reply(user, channelID, message) {
  let prefix = shoutedAt ? `HI, ${user.toUpperCase()}!!` : `Hi, ${toTitleCase(user)}!`
  bot.sendMessage({
    to: channelID,
    message: `${prefix} ${message}`
  });

  shoutedAt = false;
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

  if (existing) return `You already have a **${toTitleCase(args.item)}** listing.`;
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

function updateItemInCatalogue(user, args) {
  const listing = searchCatalogue({seller: user, item: args.item})[0];
  if (listing) {
    updateCatalogueItem(listing, args);
    return `I've updated your **${args.item}** listing`;
  }

  return `I couldn't find a listing for **${args.item}** that belongs to you.`;
}

function updateCatalogueItem(listing, args) {
  if (args.new_item) listing.item = args.new_item;
  if (args.quantity) listing.quantity = args.quantity;
  if (args.price) listing.price = args.price;
  if (args.location) listing.location = args.location;

  updateLocalCatalogue();
}

function removeItemFromCatalogue(user, args) {
  const listing = searchCatalogue({seller: user, item: args.item})[0];
  if (listing) {
    deleteCatalogueEntry(listing);
    return `I've removed your **${args.item}** listing`;
  }

  return `I couldn't find a listing for **${args.item}** that belongs to you.`;
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
  const message = [
    `• **${toTitleCase(result.seller)}** is selling`,
    `**${toTitleCase(result.item)}**`,

  ]
  const presentArgs = Object.keys(result);

  if (presentArgs.includes('quantity')) message.push(`**(${result.quantity})**`);
  if (presentArgs.includes('price')) message.push(`for **${toTitleCase(result.price)}**`);
  if (presentArgs.includes('location')) message.push(`at **${toTitleCase(result.location)}**`);

  return message.join(' ');
}

function searchCatalogue(args) {
  // When a search is done, we don't know which args will be passed in which order.
  // This is a weird solution but it allows for any combination of these args.
  let currentListings = catalogue.listings;
  if (args.seller) currentListings = currentListings.filter(e => e.seller === args.seller);
  if (args.item) currentListings = currentListings.filter(e => e.item.startsWith(args.item));
  if (args.location) currentListings = currentListings.filter(e => e.location === args.location);
  return currentListings;
}

function parseInput(message) {
  const parsedArgs = {};
  const knownArgs = ['item', 'quantity', 'price', 'location', 'seller', 'new_item'];
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
        },
        {
          "name": "Example: Updating an item in the catalogue",
          "value": "`!cat update item: diamond price: 1 dirt`"
        }
      ]
    }
  });
}
