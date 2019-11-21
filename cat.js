const { prefix, token, catalogueFile } = require('./config.json');
const inputParse = require('./cat_modules/parse_input');
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = inputParse.run(message.content);
  if (!client.commands.has(args.action)) return promptHelp(message);

  const action = client.commands.get(args.action);

  if (!action.valid(args)) return invalidArgsReason(message, action.usage);

  try {
    action.execute(message, catalogue, args);
  } catch (error) {
    console.error(error);
    message.channel.send("Oops.. something went wrong. Please notify the author with how you did this :slight_smile:");
  }
});

function promptHelp(message) {
  const user = message.author.username;
  message.channel.send(`Hi, ${user}! I don't understand that. See \`!cat help\` for more usage information.`);
}

function invalidArgsReason(message, usage) {
  const user = message.author.username;
  message.channel.send(`Hi, ${user}! Here's how you use that \`${usage}\``);
}

let catalogue;

function loadCatalogue() {
  catalogue = JSON.parse(fs.readFileSync(catalogueFile));
  console.log('Catalogue loaded from file.');
}

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

client.login(token);
