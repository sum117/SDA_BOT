const {createForm}  = require('../../../functions')
const { Collection } = require('discord.js')
const fichaMap = new Map()
const {client} = require('../../../index')
client.sessionChest = new Collection()
const {registerChannel} = require('../../../../../config.json')
module.exports = {
  type: 'MESSAGE_COMPONENT',
  execute(interaction) {
    if (
      !interaction.isSelectMenu() &&
      !interaction.channelId.includes(registerChannel)
    )
      return

    if (!fichaMap.get(interaction.user.id)) {
      const firstChoices = new Map([
        [interaction.customId, interaction.values[0]],
      ])
      fichaMap.set(interaction.user.id, firstChoices)
      console.log(fichaMap)
      return choiceResponse()
    } else {
      /**
       * @type {Map}
       * @const cachedChoices Mapa guardado no primeiro passo. */
      const cachedChoices = fichaMap.get(interaction.user.id)
      console.log(cachedChoices)

      cachedChoices.set(interaction.customId, interaction.values[0])
      fichaMap.set(interaction.userId, cachedChoices)
      console.log(cachedChoices)
      if (cachedChoices.size === 3) {
        client.sessionChest.set(interaction.user.id, cachedChoices)
        fichaMap.delete(interaction.user.id)
        return interaction.showModal(createForm())
      }
      return choiceResponse()
    }

    function choiceResponse() {
      const optionLabel = interaction.component.options.find(
        (option) => option.value === interaction.values[0],
      ).label
      return interaction.reply({
        content: 'Selecionei ' + optionLabel + ', continue!',
        ephemeral: true,
      })
    }
  },
}
