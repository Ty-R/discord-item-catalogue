const { prefix, token } = require('./config.json');
const inputParse = require('./cat_modules/parse_input');
const Discord = require('discord.js');
const db = require('./cat_modules/db');
const fs = require('fs');

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

const user = require('./cat_modules/user');

function actionFromMessage(message) {
  return client.commands.find(cmd => cmd.name === message.content.match('\\s([^\\s]*\\b)\\s?')[1]);
}

function requiredArgsMet(givenArgs, requiredArgs) {
  return requiredArgs.every((arg) => Object.keys(givenArgs).includes(arg));
}

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const name = getRelativeName(message);
  const action = actionFromMessage(message);

  if (!action) {
    return promptHelp(message.channel, name);
  }

  const args = inputParse.run(message, action.name);

  console.log(args)

  user.findOrCreate(message.author.id, name).then(user => {
    if (action.adminLocked && !!!user.admin) {
      return promptHelp(message.channel, name);
    }

    if (!requiredArgsMet(args, action.requiredArgs)) {
      return replyTo(message.channel, name, {
        success: false,
        message: `Here's how you use that \`${prefix} ${action.usage}\`. See \`${prefix} help\` for more usage information.`
      });
    }

    try {
      action.execute(args, user).then((result) => {
        replyTo(message.channel, name, result);
      }).catch((err) => {
        logger.info(err)
      });
    } catch (error) {
      logger.info(`${error}`);
      message.channel.send("Oops.. something went wrong. Please notify the author with how you did this.");
    }
  });
});

function promptHelp(channel, user) {
  replyTo(channel, user, {
    success: false,
    message: `I don't understand that. See \`${prefix} help\` for more usage information.`
  });
}

function segmentedResponse(responseMessage) {
  const segments = [];
  let currentMessage = '';
  messageLines = responseMessage.split("\n");

  messageLines.forEach(line => {
    line 
    if ((currentMessage.length + line.length) <= 2000) {
      currentMessage = currentMessage + line + "\n";
    } else {
      segments.push(currentMessage);
      currentMessage = '';
    }
  });

  segments.push(currentMessage);
  return segments;
}

function messageStart(actionSuccess, user) {
  return actionSuccess ? `Hi, ${user}! ` : `Sorry, ${user}. `
}

function getRelativeName(message) {
  if (message.member) {
    return message.member.nickname || message.author.username;
  }

  return message.author.username;
}

function replyTo(channel, user, result) {
  if (typeof(result.message) === 'string') {
    result.message = messageStart(result.success, user) + result.message;
    segmentedResponse(result.message).forEach(response => channel.send(response));
  } else {
    channel.send(result.message);
  }
}

client.login(token);
