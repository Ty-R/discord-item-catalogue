const Discord = require('discord.js');
const fs = require('fs');
const { status, statusType } = require('../config.json');

exports.run = () => {
  const client = new Discord.Client();
        client.commands = new Discord.Collection();

  client.on("ready", () => {
    client.user.setActivity(status, { type: statusType });
  });

  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
  }

  return client;
}
