const { Client } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: 32767 });
exports.client = client;
const config = require('../../config.json');


const guildInvites = new Map(); // Mapa para guardar o ID do servidor e os usos dos invites.
exports.guildInvites = guildInvites;

const presentationRole = '979506584772288562'; // Cargo de apresentações.
exports.presentationRole = presentationRole;

const presentationChannel = '977096309884473344'; // Canal de apresentações.
exports.presentationChannel = presentationChannel;

const generalChannel = '977081396839448596'; // Canal geral.
exports.generalChannel = generalChannel;

const mediaChannel = '977083633435279390'; // Canal de mídia.
exports.mediaChannel = mediaChannel;

//Event Handler
const events = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));

for (e of events) {
	const event = require(`./events/${e}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};

client.login(config.token);


