const { prefix, token, admin_ids } = require('./config.json');
const inputParse  = require('./cat_modules/parse_input');
const db          = require('./cat_modules/db');
const Discord     = require('discord.js');
const fs          = require('fs');

let logger = require('./logger'); 
    logger = require('winston'); // requiring the file above runs the code to create a default logger

const client = new Discord.Client();
      client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

db.connect('./db/catalogue.db');

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = inputParse.run(message.content, client.commands);
  const action = client.commands.get(args.action);

  if (!action) {
    return promptHelp(message);
  }

  if (action.adminLocked) {
    if (!admin(message.author)) return;
  }

  // "valid" is determined by the presence of primary and secondary arg values.
  // If adding a listing we need both primary and secondary (item, price).
  // If removing we only need the primary (ID).
  if (!action.valid(args)) {
    return invalidArgsReason(message, action.usage);
  }

  try {
    action.execute(message, args);
  } catch (error) {
    logger.info(`${error}`);
    message.channel.send("Oops.. something went wrong. Please notify the author with how you did this.");
  }
});

function admin(user) {
  return admin_ids.includes(`${user.id}`);
}

function promptHelp(message) {
  const user = message.author.username;
  message.channel.send(`Sorry, ${user}. I don't understand that. See \`!cat help\` for more usage information.`);
}

function invalidArgsReason(message, usage) {
  const user = message.author.username;
  message.channel.send(`Hi, ${user}! Here's how you use that \`${usage}\`. See \`!cat help\` for more usage information.`);
}

client.login(token);
