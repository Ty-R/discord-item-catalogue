const { prefix, token } = require('./config.json');
const inputParse = require('./cat_modules/parse_input');
const validator = require('./cat_modules/validator');
const responder = require('./cat_modules/responder');
const discordClient = require('./cat_modules/setup_client');
const user = require('./cat_modules/user');

let logger = require('./cat_modules/logger'); 
    logger = require('winston');

const client = discordClient.run();

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  try {
    const input = inputParse.run(message);

    user.findOrCreate(message.author.id, username(message)).then(user => {
      logger.info(`${user.name} -- ${JSON.stringify(input)}`);

      const validatorResponse = validator.run(input, client.commands, user.admin);

      if (!validatorResponse.success) {
        return responder.respond(message.channel, user.name, validatorResponse);
      }

      validatorResponse.command.execute(validatorResponse.args, user).then((result) => {
        return responder.respond(message.channel, user.name, result);
      }).catch((error) => {
        console.log(error);
        logger.error(error);
        message.channel.send("Oops.. something went wrong. The issue has been logged. Please notify the author with how you did this.");
      });
    });
  } catch(error) {
    console.log(error);
    logger.error(error);
  };
});

function username(message) {
  if (message.member) {
    return message.member.nickname || message.author.username;
  }
  return message.author.username;
}

client.login(token);
