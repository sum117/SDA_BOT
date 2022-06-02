const { Formatters, MessageAttachment } = require('discord.js');
const database = require('../db');
const { BulkEmoji } = require("../functions");
const { client, presentationChannel, presentationRole, generalChannel, mediaChannel} = require("..");

/**
 * Evento de criação de mensagens.
 * @param {Object} msg A mensagem que foi postada.
 * @returns {Object} O objeto da mensagem.
 */
module.exports = { 
    name: 'messageCreate', 
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
        } else if (msg.channel.id === generalChannel && msg.attachments.size >= 1) {
            setTimeout(() => {
                msg.attachments.forEach(attachment => {
                    const media = new MessageAttachment(attachment.url);

                    msg.guild.channels.cache.get(mediaChannel).send({
                        content: `Imagem enviada em ${Formatters.channelMention(generalChannel)} por ${Formatters.userMention(msg.author.id)}`,
                        files: [media]
                    })
                        .then(mediaMsg => { BulkEmoji(mediaMsg, ['✅', '❌']); }).catch(err => console.log('Não consegui reagir a mensagem: ' + err))
                        .then(() => msg.delete()).catch(err => console.log('Erro, a mensagem não existe: ' + err));
                });

            }, 60 * 1000);
        };

        if (msg.guildId === mainGuild.id && msg.author.id === msg.guild.ownerId && msg.content.match(/^eval/)) {
            eval(x = msg.content.replace(/(```|js|eval|\s\s)/gm, ''));
        }

    }
}