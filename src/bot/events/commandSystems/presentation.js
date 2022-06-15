const database = require('../../db').presentation
const { presentationChannel, loginoutChannel } = require('../../../../config.json').channels
const { mainGuild } = require('../../../../config.json')
const { presentationRole } = require('../../../../config.json').roles
const { Formatters } = require('discord.js')
const {msToTime} = require('../../functions');
const {client} =require('../../index')
module.exports = new Map([
  ['ready', ready],
  ['messageCreate', messageCreate],
  ['guildMemberRemove', guildMemberRemove],
])

function ready() {
  database.sync()
}

async function messageCreate() {
  if (this.channel.id === presentationChannel) {
    database.presentation
      .create({
        userID: BigInt(this.author.id),
        msgID: BigInt(this.id),
      })
      .then(() => {
        this.guild.members
          .fetch(this.author.id)
          .then((member) => member.roles.add(presentationRole))

        this.reply(
          `Sua apresentação foi registrada com sucesso, ${Formatters.userMention(
            this.author.id,
          )} e você ganhou o cargo ${Formatters.roleMention(presentationRole)}`,
        )
          .then((msgObj) => setInterval(() => msgObj.delete(), 10000))
          .catch((err) => console.log('Erro, a mensagem não existe: ' + err))
      })
      .catch((err) => {
        if (err.name === 'SequelizeUniqueConstraintError')
          this.reply({
            ephemeral: true,
            content: `Você já se apresentou. Por favor, não escreva mais nada neste canal.`,
          })
            .then((msgObj) => setInterval(() => msgObj.delete(), 10000))
            .catch((msgErr) =>
              console.log('Erro, a mensagem não existe: ' + msgErr),
            )
      })
  }
}

async function guildMemberRemove() {

  database
    .findOne({ where: { userID: BigInt(this.id) } })
    .then((presentation) => {
      this.guild.channels
        .fetch(presentationChannel)
        .then((channel) => channel.messages.delete(presentation.get('msgID')))
        .catch((err) =>
          console.log('Erro, a mensagem de apresentação não existe: ' + err),
        )
    })

  await client.guilds.fetch(mainGuild).channels
    .fetch(loginoutChannel)
    .send(
      `🟥 O usuário ${this.user.username}, de ID ${this.id} com \`${msToTime(
        Date.now() - this.joinedTimestamp,
      )}\` de servidor saiu.`,
    )
}
