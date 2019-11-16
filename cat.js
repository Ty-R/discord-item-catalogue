const Discord = require('discord.io');
const auth = require('./auth.json');
const fs = require('fs');
const pluralize = require('pluralize');

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
  if (user === botUsername) return;

  // The user might accidently have caps on, we don't want this to
  // not reach the bot, but we could have some fun with it..
  if (message.includes('!CAT ')) {
    shoutedAt = true;
    message = message.toLowerCase();
  }
  
  // Not all commands require args, let's handle them now.
  if (message.includes('!cat help')) {
    sendCustomHelpMessage(channelID);
    return;
  }

  if (message.includes('c:reload')) {
    loadCatalogue();
    return;
  }
  
  if (message.includes('!cat ')) {
    const args = parseInput(message);
    if (!argsValid(args)) return noComprendo(user, channelID);

    user = user.toLowerCase();

    switch(args.action) {
      case 'add':
        reply(user, channelID, addItemToCatalogue(user, args));
        break;
      case 'remove':
        reply(user, channelID, removeItemFromCatalogue(user, args));
        break;
      case 'update':
        reply(user, channelID, updateItemInCatalogue(user, args));
        break;
      case 'search':
        const { resultCount, results } = botSearchResults(searchCatalogue(args));
        reply(user, channelID, `That query returned ${pluralize('result', resultCount, true)} \n\n${results}`);
    }
  }
});

function argsValid(args) {
  switch(args.action) {
    case 'add':
      return !!args.primary && !!args.secondary;
    case 'remove':
      return !!args.primary;
    case 'update':
      return !!args.flag && !!args.primary && !!args.secondary;
    case 'search':
      return true;
    default:
      return false;
  }
}

function noComprendo(user, channelID) {
  reply(user, channelID, "I don't understand that. See `!cat help` for more information");
}

function reply(user, channelID, message) {
  let prefix = shoutedAt ? `HI, ${user.toUpperCase()}!!` : `Hi, ${toTitleCase(user)}!`;
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
  });
}

function addItemToCatalogue(user, args) {
  const existing = searchCatalogue(args).find(e => e.seller === user);

  if (existing) return `You already have a "**${args.primary}**" listing.`;
  createNewCatalogueEntry(user, args);
  return `I've added **${args.primary}** to the catalogue for you`;
}

function createNewCatalogueEntry(user, args) {
  const newListing = {
    seller: user,
    item: args.primary,
    price: args.secondary,
    location: args.optional
  };

  Object.keys(newListing).forEach((key) => (newListing[key] == null) && delete newListing[key]);

  catalogue.listings.push(newListing);
  updateLocalCatalogue();
}

function updateItemInCatalogue(user, args) {
  if (['u', 's'].includes(args.flag)) return 'You cannot update the name of the seller!';
  const listing = searchCatalogue(args).find(e => e.seller === user);
  if (listing) {
    updateCatalogueItem(listing, args);
    return `I've updated your **${args.primary}** listing`;
  }

  return `I couldn't find a listing for "**${args.primary}**" that belongs to you.`;
}

function updateCatalogueItem(listing, args) {
  const query = queryFromFlag(args.flag);
  listing[query] = args.secondary;
  updateLocalCatalogue();
}

function removeItemFromCatalogue(user, args) {
  const listing = searchCatalogue(args).find(e => e.seller === user);
  if (listing) {
    deleteCatalogueEntry(listing);
    return `I've removed your  **${args.primary}** listing`;
  }

  return `I couldn't find a listing for "**${args.primary}**" that belongs to you.`;
}

function deleteCatalogueEntry(listing) {
  const index = catalogue.listings.indexOf(listing);
  catalogue.listings.splice(index, 1);
  updateLocalCatalogue();
}

function botSearchResults(results) {
  return {
    resultCount: results.length,
    results: results.map(result => resultMessage(result)).join("\n"),
  };
}

function resultMessage(result) {
  // Seller and item will be present in a result,
  // but the other args are optional, so we need,
  // to create a 'modular' message.
  const message = [
    `• **${toTitleCase(result.seller)}** is selling`,
    `**${result.item}**`,
  ];

  const presentArgs = Object.keys(result);

  if (presentArgs.includes('price')) message.push(`for **${result.price}**`);
  if (presentArgs.includes('location')) message.push(`at **${toTitleCase(result.location)}**`);

  return message.join(' ');
}

function searchCatalogue(args) {
  const query = args.action === 'update' ? 'item' : queryFromFlag(args.flag);
  console.log(`Searching listings by: ${query}`);
  try {
    return catalogue.listings.filter(e => e[query].includes(args.primary));
  } catch {
    console.log(`Search for ${query} failed; likely not a valid field.`);
    return [];
  }
}

function queryFromFlag(flag) {
  switch(flag) {
    case 's': // (s)eller
      return 'seller';
    case 'u': // (u)ser (seller alt)
      return 'seller';
    case 'i': // (i)tem
      return 'item'
    case 'b': // (b)lock (item alt)
      return 'item'
    case 'l': // (l)ocation
      return 'location'
    case 'p': // (p)rice
      return 'price'
    case 'c': // (c)ost (price alt
      return 'price'
  }

  return 'item'; // default to item if no flag is specified
}

function parseInput(message) {
  const args = {
    action: null,
    flag: null,
    primary: null,
    secondary: null,
    optional: null,
  }

  const re = `!cat (add|search|update|remove)\\s(\\-(.)\\s)?([^:@]*)(?::([^:@]*\\b)(?:\\s@(.*))?)?`;
  const matchedArgs = message.match(re);
  
  if (!matchedArgs) return args;

  args.action = matchedArgs[1];
  args.flag = matchedArgs[3]
  args.primary = matchedArgs[4];
  args.secondary = matchedArgs[5];
  args.optional = matchedArgs[6];

  return tidyArgs(args);
}

function tidyArgs(args) {
  // We're settings all args in one place
  // but not all args will always be present.
  // This will remove any args that weren't
  // specified, and fix the values of the
  // ones that were.
  Object.keys(args).forEach((key) => {
    if (args[key] == null) {
      delete args[key];
    } else {
      args[key] = toSafeString(args[key]);
    }
  });

  console.log(args)
  return args;
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
  return str.replace(/[^ \w-]+/g, '').trim().toLowerCase();
}

function loadCatalogue() {
  catalogue = JSON.parse(fs.readFileSync(catalogueFile));
  console.log('Catalogue loaded from file.');
}

function sendCustomHelpMessage(channelID) {
  bot.sendMessage({
    to: channelID,
    message: "Here's some basic information about me",
    embed: {
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
}
