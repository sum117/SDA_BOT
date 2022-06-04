const {Interaction} = require('discord.js');

const fs = require('fs');
const commands = fs.readdirSync(`${__dirname}/src/bot/events/interactionCreate/commands`).filter(file => file.endsWith('.js'));

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {Interaction} interaction A interação que disparou a execução do evento.
     */
    async execute(interaction) {
        
        for (each of commands) {
            const used = require(`./commands/${each}`);
            if (interaction.type === used.type) used.execute(interaction);
        }      
    }
}


