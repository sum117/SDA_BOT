const { mediaChannel, generalChannel } = require('../../../../../config.json').channels
const { Formatters, MessageAttachment } = require('discord.js');
const BulkEmoji = require('../../../functions');

module.exports = {
    type: 'prefixless',
    name: 'mediaModerator',
    description: 'Um comando automático do servidor que coloca as mensagens em seus devidos lugares.',
    execute(msg) {
        if (msg.channel.id === generalChannel && (msg.attachments.size >= 1 || msg.content.match(/https?/g))) {
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
    }
}