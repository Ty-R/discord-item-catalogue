const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fs = require('fs');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});

logger.level = 'debug';

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
      logger.error(err);
      return;
    };
    catalogue = JSON.parse(fs.readFileSync(catalogueFile));
  });
} else {
  catalogue = JSON.parse(fs.readFileSync(catalogueFile))
}

// No DB is being used here. We're using a file to store the items.
// Let's load it into memory now so save having to load, parse, and read from
// it every time a lookup is performed.
// const catalogue = JSON.parse(fs.readFileSync(catalogueFile));

bot.on('message', function (user, userID, channelID, message, evt) {
  if (message.includes('!cat')) {
    if(user === botUsername) return;
  
    const action = message.split(' ', 2)[1];
    const args = parseInput(message);

    switch(action) {
      case 'search':
        if (invalidateActionArgs('search', args)) {
          notifyInvalidArgs(user, channelID);
          break;
        }

        const response = formatItemSellers(itemInCatalogue(args.item));
        bot.sendMessage({
          to: channelID,
          message: `Hi, ${user}! ${response}`
        });
      break;
      case 'add':
        if (invalidateActionArgs('add', args)) {
          notifyInvalidArgs(user, channelID);
          break;
        }

        createCatalogueEntry(user, args);
        bot.sendMessage({
          to: channelID,
          message: `Hi, ${user}! That's been added to the catalogue.`
        });
      break;
      case 'remove':
        if (invalidateActionArgs('remove', args)) {
          notifyInvalidArgs(user, channelID);
          break;
        }

        removeCatalogueEntry(user, args);
        bot.sendMessage({
          to: channelID,
          message: `Hi, ${user}! I've remove that from the catalogue for you.`
        });
      break;
      default:
        bot.sendMessage({
          to: channelID,
          message: `Hi, ${user}! Here are the list of commands I respond to: \n\n${helpCommands()}`
        });
      }
    }
});

function createCatalogueEntry(user, args) {
  // It might be that this is a new item entirely, so we'd need to create it
  // before doing anything with users.
  const catalogueItem = itemInCatalogue(args.item) || createNewCatalogueEntry(args.item);

  // The user may already have an entry for this item
  removeUserEntryFromCatalogue(catalogueItem, user);

  catalogueItem.sellers.push({
    "user": user,
    "quantity": args.quantity,
    "costs": args.price,
    "location": args.location
  })

  updateLocalCatalogue();
}

function removeCatalogueEntry(user, args) {
  const catalogueItem = itemInCatalogue(args.item)
  if (!catalogueItem) return;
  removeUserEntryFromCatalogue(catalogueItem, user);
  logger.debug(catalogueItem)
  if (catalogueItem.sellers.length === 0) removeItemFromCatalogue(args.item);
  updateLocalCatalogue();
}

function updateLocalCatalogue() {
  fs.writeFile(catalogueFile, JSON.stringify(catalogue), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("File has been created");
  });
}

function removeUserEntryFromCatalogue(catalogueItem, user) {
  const sellers = catalogueItem.sellers;
  const existingSeller = sellers.findIndex(seller => seller.user === user);
  sellers.splice(existingSeller, 1);
}

function removeItemFromCatalogue(item) {
  delete catalogue[item];
}

function itemInCatalogue(item) {
  return catalogue[item];
}

function formatItemSellers(item) {
  if (!item) return "I couldn't find that in the catalogue :frowning:";
  return [
    `That item is being sold by these sellers:`,
    item.sellers.map(seller => `\n • **${seller.user}** is selling **${seller.quantity}** for **${seller.costs}** at **${seller.location}**`),
  ].join("\n");
}

function createNewCatalogueEntry(item) {
  catalogue[item] = {"sellers":[]};
  return catalogue[item];
}

function helpCommands() {
  return [
    'To **add** an item to the catalogue: `!cat add item:[item] quantity:[quantity] price:[price] location:[location]`',
    'To **search** for an item in the catalogue: `!cat search item:[item]`',
    'To **remove** an an item in the catalogue: `!cat remove item:[item]`'
  ].join("\n");
}

function parseInput(message) {
  // We want to turn whatever the input is into a usable hash.
  // We can be sure that certain values will exist in the
  // input so let's start there.
  const x = {};
  const knownArgs = ['item', 'quantity', 'price', 'location'];

  for (let argIndex in knownArgs) {
    let arg = knownArgs[argIndex];
    let match = message.match(`${arg}:\\s?(.*?)(?=(?:\\s\\w*:|$))`);
    if (match) x[arg] = match[1].trim();
  }

  return x;
}

function invalidateActionArgs(action, args) {
  let valid;
  let expectedArgs;

  const actualArgs = Object.keys(args).sort();

  switch(action) {
    case 'add':
      expectedArgs = ['item', 'quantity', 'price', 'location'].sort();
    break;
    case 'remove':
      expectedArgs = ['item'];
    break;
    case 'search':
      expectedArgs = ['item'];
  }

  valid = (JSON.stringify(expectedArgs) == JSON.stringify(actualArgs)) 
  return !valid;
}

function notifyInvalidArgs(user, channelID) {
  bot.sendMessage({
    to: channelID,
    message: `Hi, ${user}! Expected fields are missing from the command. See 'help' for the expected formats.`
  });
}
