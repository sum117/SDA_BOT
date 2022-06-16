const { ModalSubmitInteraction, MessageEmbed } = require("discord.js")
const { title } = require('../../../functions')
const { sessionChest } = require("./ficha")
const {fichaAdminChannel} = require('../../../../../config.json').channels

module.exports = {
    type: 'MODAL_SUBMIT',
    /**@param {ModalSubmitInteraction} interaction */
    async execute(interaction) {
        if(interaction.customId === 'ficha') await interaction.reply('✅ Ficha recebida com sucesso. Por favor, aguarde sua aprovação. Você será notificado. Caso suas DMs estiverem abertas, você receberá uma cópia do que nós recebemos.')

        const user = interaction.user
        const cache = new Map()
        const map = new Map()
        let eArray = [];
        const adminChan = interaction.guild.channels.cache.get(fichaAdminChannel)
        const choices = sessionChest.get(user.id);
        const colors = {
            austera: 'A47B00',
            perserata: '056382',
            oscuras: '015CA0',
            equinocio: '009100',
            ehrantos: 'FD7801',
            melancus: '000000',
            observata: 'FFFFFF',
            invidia: '015CA0',
            insanata: 'C50001',
        }


        map.set('nome', interaction.fields.getTextInputValue('persoNome'))
        map.set('personalidade', interaction.fields.getTextInputValue('persoPersonalidade'))
        map.set('fisico', interaction.fields.getTextInputValue('persoFisico'))
        map.set('poder', interaction.fields.getTextInputValue('persoPoder'))
        map.set('imagem', interaction.fields.getTextInputValue('persoImagem'))
        cache.set(user, map)

        const embed = new MessageEmbed()
            .setAuthor({name: user.username})
            .setTitle(map.get('nome'))
            .setThumbnail(map.get('imagem'))
            .setColor(colors.get(choices.get('soma')))
            .addField('Soma', choices.get('soma'))
            .addField('Genero', choices.get('genero'))
            .addField('Fantasma', choices.get('purgatorio'))

        eArray.push(embed)
        
        map.delete('nome')
        map.forEach((value, key) => {
            const embed = new MessageEmbed()
                .setTitle(title(key))
                .setColor(colors.get(choices.get('soma')))
                .setDescription(value)
            eArray.push(embed)
        })

        adminChan.send({content: `Ficha de ${Formatters.userMention(user)}`, embeds: eArray})

    }
}