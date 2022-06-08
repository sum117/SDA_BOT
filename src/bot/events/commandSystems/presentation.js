const database = require('../../db')
const { presentationChannel, loginoutChannel } = require('../../../../config.json').channels;
const { presentationRole } = require('../../../../config.json').roles;
const {Formatters} = require('discord.js');
module.exports = new Map([
    ['ready', ready],
    ['messageCreate', messageCreate],
    ['guildMemberRemove', guildMemberRemove]
])

function ready() {
    database.presentation.sync();
}

async function messageCreate() {
    if (this.channel.id === presentationChannel) {

        database.presentation.create({
            userID: BigInt(this.author.id),
            msgID: BigInt(this.id),
        }).then(() => {

            this.guild.members.fetch(this.author.id).then((member) => member.roles.add(presentationRole));

            this.reply(`Sua apresentação foi registrada com sucesso, ${Formatters.userMention(this.author.id)} e você ganhou o cargo ${Formatters.roleMention(presentationRole)}`)
                .then((msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(err => console.log('Erro, a mensagem não existe: ' + err));

        }).catch(err => {

            if (err.name === 'SequelizeUniqueConstraintError')
            this.reply({
                    ephemeral: true,
                    content: `Você já se apresentou. Por favor, não escreva mais nada neste canal.`
                }).then((msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(msgErr => console.log('Erro, a mensagem não existe: ' + msgErr));

        });
    }
}

async function guildMemberRemove() {
    const chan = await this.guild.channels.fetch(loginoutChannel);

    database.presentation.findOne({ where: { userID: BigInt(this.id) } })
        .then(presentation => {
            this.guild.channels.fetch(presentationChannel)
                .then((channel) => channel.messages.delete(presentation.get('msgID'))).catch(err => console.log('Erro, a mensagem de apresentação não existe: ' + err));
        });

    await this.guild.channels.fetch(loginoutChannel).send(`🟥 O usuário ${this.user.username}, de ID ${this.id} com \`${msToTime(Date.now() - this.joinedTimestamp)}\` de servidor saiu.`);
}