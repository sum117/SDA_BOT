//on the ready event
database.presentation.sync();


// On the MessageCreate Event
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
}

// On the guildMemberRemove event
const loginoutChannel = await member.guild.channels.fetch('977087066129174538');

database.presentation.findOne({ where: { userID: BigInt(member.id) } })
    .then(presentation => {
        member.guild.channels.fetch(presentationChannel)
            .then((channel) => channel.messages.delete(presentation.get('msgID'))).catch(err => console.log('Erro, a mensagem de apresentação não existe: ' + err));
    });

loginoutChannel.send(`🟥 O usuário ${member.user.username}, de ID ${member.id} com \`${msToTime(Date.now() - member.joinedTimestamp)}\` de servidor saiu.`);