const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });
const config = require('../../config.json');

//Event Handler
const fs = require('fs');
const events = fs.readdirSync(`${__dirname}/events`);

for (e of events) {
	const event = require(`./events/${e}/${e}.js`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};

client.login(config.token);


