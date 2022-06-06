const { Interaction,MessageAttachment, Formatters} = require("discord.js");
const { createForm} = require('../functions');
const akaneko = require('akaneko');
const fichaMap = new Map();
const sessionChest = new Map();
module.exports = {
    name: 'interactionCreate',
    /**
     * @param {Interaction} interaction A interação que disparou a execução do evento.
     */
    async execute(interaction) {

        //Interaction
        if (interaction.isCommand()) {
            //Comando do Akaneko
            if (interaction.commandName === 'hentai') {

                const option = interaction.options.getString('categoria');

                await interaction.deferReply()
                let request = await akaneko.nsfw[option]();
                interaction.editReply({
                    content: '💗 NSFW spawnado por ' + Formatters.userMention(interaction.user.id),
                    files: [request]
                });
            };
        }
        // Select Menu
        if (!interaction.isSelectMenu() || interaction.channelId != '977090435845603379') return;

        if (!fichaMap.get(interaction.user.id)) {
            const firstChoices = new Map([[interaction.customId, interaction.values[0]]]);
            fichaMap.set(interaction.user.id, firstChoices);
            console.log(fichaMap)
            return choiceResponse();
        } else {
            /**
             * @type {Map}
             * @const cachedChoices Mapa guardado no primeiro passo. */
            const cachedChoices = fichaMap.get(interaction.user.id);
            console.log(cachedChoices);

            cachedChoices.set(interaction.customId, interaction.values[0]);
            fichaMap.set(interaction.userId, cachedChoices);
            console.log(cachedChoices);
            if (cachedChoices.size === 3) { 
                sessionChest.set(interaction.user.id, cachedChoices);
                fichaMap.delete(interaction.user.id);
                return interaction.showModal(createForm());
            }
            return choiceResponse();
        }

        function choiceResponse() {
            const optionLabel = interaction.component.options.find(option => option.value === interaction.values[0]).label;
            return interaction.reply({
                content: 'Selecionei ' + optionLabel + ', continue!', 
                ephemeral: true
            });
        }
    }
}


