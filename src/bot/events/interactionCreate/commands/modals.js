const { ModalSubmitInteraction, MessageEmbed, Formatters, MessageActionRow, MessageButton } = require("discord.js")
const { title } = require('../../../functions')
const {client} = require('../../../index')
const {fichaAdminChannel} = require('../../../../../config.json').channels

module.exports = {
    type: 'MODAL_SUBMIT',
    /**@param {ModalSubmitInteraction} interaction */
    async execute(interaction) {
        if(interaction.customId === 'ficha') await interaction.reply({ephemeral: true, content: '✅ Ficha recebida com sucesso. Por favor, aguarde sua aprovação. Você será notificado. Caso suas DMs estiverem abertas, receberá uma cópia do que nós recebemos.'})

        const user = interaction.user
        const cache = new Map()
        const map = new Map()
        let eArray = []
        const adminChan = interaction.guild.channels.cache.get(fichaAdminChannel)
        const choices = client.sessionChest.get(user.id)
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
            .setAuthor({name: user.username, iconURL: user.avatarURL({dynamic:true, size:1024})})
            .setTitle(map.get('nome'))
            .setThumbnail(map.get('imagem'))
            .setColor(colors[choices.get('soma')])
            .addField('Soma', title(choices.get('soma')), true)
            .addField('Genero', title(choices.get('genero')), true)
            .addField('Fantasma', title(choices.get('purgatorio')), true)

        eArray.push(embed)
        
        map.delete('nome')
        map.forEach((value, key) => { 
            const embed = new MessageEmbed()
                .setTitle(title(key))
                .setColor(colors[choices.get('soma')])
                .setDescription(value)
            if (key === 'imagem') embed.setImage(value).setTitle('').setDescription('')
            eArray.push(embed)
        })

        const components = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('aprovar')
                    .setLabel('Simplesmente Aprovado')
                    .setEmoji('✅')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('contato')
                    .setLabel('Hora da Conversa')
                    .setEmoji('💬')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('reprovado')
                    .setLabel('Simplesmente Reprovado')
                    .setEmoji('❌')
                    .setStyle('DANGER')
            )
        adminChan.send({content: `Ficha de ${user}`, embeds: eArray, components: [components]})

    }
}