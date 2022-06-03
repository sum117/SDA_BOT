const { Formatters, MessageAttachment, Message } = require('discord.js');
const database = require('../db');
const { BulkEmoji, createTupper, createDescEmbed, clearMessages, createCharSelectors, saveToFile } = require("../functions");
const { presentationChannel, presentationRole, generalChannel, mediaChannel } = require("..");
module.exports = {
    name: 'messageCreate',
    /**
     * Evento de criação de mensagens.
     * @param {Message} msg A mensagem que foi postada.
     * @returns {Object} O objeto da mensagem.
     */
    async execute(msg) {
        const mainGuild = msg.guild;
        /**
         * Essa script administra as apresentações do servidor SDA.
         */
        if (msg.channel.id === presentationChannel) {

            database.presentation.create({
                userID: BigInt(msg.author.id),
                msgID: BigInt(msg.id),
            }).then(() => {

                msg.guild.members.fetch(msg.author.id).then((member) => member.roles.add(presentationRole));

                msg.reply(`Sua apresentação foi registrada com sucesso, ${Formatters.userMention(msg.author.id)} e você ganhou o cargo ${Formatters.roleMention(presentationRole)}`)
                    .then((msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(err => console.log('Erro, a mensagem não existe: ' + err));

            }).catch(err => {

                if (err.name === 'SequelizeUniqueConstraintError')
                    msg.reply({
                        ephemeral: true,
                        content: `Você já se apresentou. Por favor, não escreva mais nada neste canal.`
                    }).then((msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(msgErr => console.log('Erro, a mensagem não existe: ' + msgErr));

            });

            /**
             * Essa script administra as imagens e links enviados em canais errados.
             */
        } else if (msg.channel.id === generalChannel && (msg.attachments.size >= 1 || msg.content.match(/https?/g))) {
            setTimeout(() => {
                if (msg.attachments.size >= 1) {
                    msg.attachments.forEach(attachment => {
                        const media = new MessageAttachment(attachment.url);

                        msg.guild.channels.cache.get(mediaChannel).send({
                            content: `Imagem enviada em ${Formatters.channelMention(generalChannel)} por ${Formatters.userMention(msg.author.id)}`,
                            files: [media]
                        })
                            .then(mediaMsg => { BulkEmoji(mediaMsg, ['✅', '❌']); }).catch(err => console.log('Não consegui reagir a mensagem: ' + err))
                            .then(() => msg.delete()).catch(err => console.log('Erro, a mensagem não existe: ' + err));
                    });
                } else {
                    msg.guild.channels.cache.get(mediaChannel).send({
                        content: `Link(s) enviado(s) em ${Formatters.channelMention(generalChannel)} por ${Formatters.userMention(msg.author.id)}:\n${msg.content.match(/https?.*/g)}`
                    })
                        .then(mediaMsg => { BulkEmoji(mediaMsg, ['✅', '❌']); }).catch(err => console.log('Não consegui reagir a mensagem: ' + err))
                        .then(() => msg.delete()).catch(err => console.log('Erro, a mensagem não existe: ' + err));
                }
            }, 60 * 1000);
        };
        // Atualmente é aqui que guardo os comandos com prefixos ou sem nenhum.
        if (msg.guildId === mainGuild.id && msg.author.id === msg.guild.ownerId && msg.content.match(/^eval/)) {
            eval(x = msg.content.replace(/(```|js|eval|\s\s)/gm, ''));
        } else if (msg.content.match(/^wail/)) {
            createTupper(msg.channel, 'Wail, a Feiticeira dos Pântanos de Lifranir', 'https://cdn.discordapp.com/attachments/978731161436188692/981995520652374056/Wail.png', msg.content.slice(4));
            msg.delete();
        } else if (msg.content.match(/^lyncoln/)) {
            createTupper(msg.channel, 'Lyncoln Starscourge, o Guardião das Estrelas', 'https://cdn.discordapp.com/attachments/969070334454153277/982053243066650704/Lyncoln.png', msg.content.slice(7));
            msg.delete();
        }
        createDescEmbed(msg).catch(err => msg.reply(err.toString()));
        
    }
}