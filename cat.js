const { prefix, token, status, statusType } = require('./config.json');
const inputParse  = require('./cat_modules/parse_input');
const validator   = require('./cat_modules/validator');
const responder   = require('./cat_modules/responder');
const Discord = require('discord.js');
const fs      = require('fs');

let logger = require('./cat_modules/logger'); 
    logger = require('winston');
const db = require('./cat_modules/db');
      db.connect('./db/catalogue.db');

const user = require('./cat_modules/user');

const client = new Discord.Client();
      client.commands = new Discord.Collection();

client.on("ready", () => {
  client.user.setActivity(status, { type: statusType})
})

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
    logger.info(`${user.name} -- ${JSON.stringify(input)}`);
    const validatorResponse = validator.run(input, client.commands, user.admin);
    if (!validatorResponse.success) {
      return responder.respond(message.channel, user.name, validatorResponse);
    }
    try {
      validatorResponse.command.execute(validatorResponse.args, user).then((result) => {
        return responder.respond(message.channel, user.name, result);
      }).catch((error) => {
        logger.error(error);
        message.channel.send("Oops.. something went wrong. Please notify the author with how you did this.");
     });
    } catch (error) {
      logger.error(error);
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
