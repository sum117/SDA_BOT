//TODO
//const mediachannel;
//const generalChannel;
module.exports = {
    type: 'prefixless',
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