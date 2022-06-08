const { createForm } = require('../../../functions')
const fichaMap = new Map();
const sessionChest = new Map();

module.exports = {
    type: 'MESSAGE_COMPONENT',
    execute(interaction) {
        if (!interaction.isSelectMenu() && !interaction.channelId.includes(registerChannel)) return;

        if (!fichaMap.get(interaction.user.id)) {
            const firstChoices = new Map([[interaction.customId, interaction.values[0]]]);
            fichaMap.set(interaction.user.id, firstChoices);
            console.log(fichaMap);
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