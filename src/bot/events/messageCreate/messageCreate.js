module.exports = {
    name: 'messageCreate',

    async execute() {
        const fs = require('fs');
        const commands = fs.readdirSync(`${__dirname}/src/bot/events/interactionCreate/commands`).filter(file => file.endsWith('.js'));
        // Command Handler
        for (each of commands) {
            const used = require(`./commands/${each}`);
            if (this.content.match(`^!${used.prefix}`)) {
                try {
                    used.execute(this);
                } catch (error) {
                    this.reply('Infelizmente este comando deu erro, ou provavelmente não existe: ' + error);
                };
            } else used.execute(this);
        };
    }
};