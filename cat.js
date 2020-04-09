const { prefix, token } = require('./config.json');
const inputParse = require('./cat_modules/parse_input');
const validator = require('./cat_modules/validator');
const responder = require('./cat_modules/responder');
const Discord = require('discord.js');
const fs = require('fs');
let logger = require('./logger'); 
    logger = require('winston'); // requiring the file above runs the code to create a default logger
const db = require('./cat_modules/db');
      db.connect('./db/catalogue.db');
const user = require('./cat_modules/user');

const client = new Discord.Client();
      client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const username = getRelativeName(message);
  const input = inputParse.run(message);

  user.findOrCreate(message.author.id, username).then(user => {
    const validatorResponse = validator.run(input, client.commands, user.admin);
    if (!validatorResponse.success) {
      return responder.respond(message.channel, user.name, validatorResponse)
    }
    try {
      validatorResponse.subCommand.execute(validatorResponse.args, user).then((result) => {
        return responder.respond(message.channel, user.name, result)
      }).catch((err) => {
        logger.info(err)
     });
    } catch (error) {
      logger.info(`${error}`);
      message.channel.send("Oops.. something went wrong. Please notify the author with how you did this.");
    }
  });
});

function getRelativeName(message) {
  if (message.member) {
    return message.member.nickname || message.author.username;
  }
  return message.author.username;
}

client.login(token);
