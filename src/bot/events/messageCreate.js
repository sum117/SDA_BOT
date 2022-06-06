const { Formatters, MessageAttachment, Message } = require('discord.js');
const database = require('../db');
const { BulkEmoji, createTupper, createDescEmbed, clearMessages, createCharSelectors, saveToFile, createRoleSelectors } = require("../functions");
const { presentationChannel, presentationRole, generalChannel, mediaChannel, activityCache} = require("..");

module.exports = {
    name: 'messageCreate',
    /**
     * Evento de criação de mensagens.
     * @param {Message} msg A mensagem que foi postada.
     * @returns {Object} O objeto da mensagem.
     */
    async execute(msg) {
        activityCache.set(msg.author.id, Date.now());
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
        } else if ([mediaChannel, '977082325307375666'].includes(msg.channelId) && !(msg.attachments.size >= 1 || msg.content.match(/https?/g)) && (msg.author.id != '974300460804636693')) {
            setTimeout(() => {
                msg.delete().catch(err => console.log(err + ' A mensagem não existe.'))
            }, 60 * 1000);

        } else if (msg.channelId === '976880373118148678' && msg.author.id != '974300460804636693') {
            let response;
            if (msg.content.match(/18/)) {
                if (!msg.member.roles.cache.has('983190321334726666')) {
                    msg.member.roles.add('983190321334726666')
                    response = await msg.reply({ content: 'Bem vindo ao Somas do Amanhã, ' + msg.author.username + '.' })
                    msg.guild.channels.cache.get(generalChannel).send(`${Formatters.userMention(msg.author.id)} ganhou acesso à comunidade, ${Formatters.roleMention('977087122345451530')}! Falem com ele!`)
                }
            } else {
                response = await msg.reply({ content: 'Você colocou o resultado incorreto. Se acha que isso é um erro, contate um administrador.' });
            }
            setTimeout(() => msg.delete().catch(err => console.log(err + ' A mensagem não existe.'), response.delete()), 5 * 1000);
        }
        // Atualmente é aqui que guardo os comandos com prefixos ou sem nenhum.
        if (msg.guildId === mainGuild.id && msg.author.id === msg.guild.ownerId && msg.content.match(/^eval/)) {
            eval(x = msg.content.replace(/(```|js|eval|\s\s)/gm, ''));
        } else if (msg.content.match(/^!wa/)) {
            createTupper(msg.channel, 'Wail, a Feiticeira dos Pântanos de Lifranir', 'https://cdn.discordapp.com/attachments/978731161436188692/981995520652374056/Wail.png', msg.content.slice(3));
            msg.delete();
        } else if (msg.content.match(/^ly/)) {
            createTupper(msg.channel, 'Lyncoln Starscourge, o Guardião das Estrelas', 'https://cdn.discordapp.com/attachments/969070334454153277/983157720997838909/Lyncoln.png', msg.content.slice(3));
            msg.delete();
        } else if (msg.content.match(/^!ha/)) {
            createTupper(msg.channel, 'Harald, o Ancião da Colina de Auferis', 'https://media.discordapp.net/attachments/969945290666815569/982073475822940230/Ancient.png?width=481&height=675', msg.content.slice(3));
            msg.delete();
        } else if (msg.content.match(/^!se/)) {
            createTupper(msg.channel, 'Seris, a Santíssima Sangue de Deus', 'https://cdn.discordapp.com/attachments/969079040847798285/983176284442099772/Seris.png', msg.content.slice(3));
            msg.delete();
        }
        createDescEmbed(msg).catch(err => msg.reply(err.toString()));
    }
}