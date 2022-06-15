const guildInvites = new Map()
const inviteCodeUses = new Map()
const { mainGuild } = require('../../../../config.json')
const {loginoutChannel} = require('../../../../config.json').channels
const {client} = require('../../index');
const {Formatters} = require('discord.js');

module.exports = new Map([
  ['ready', ready],
  ['guildMemberAdd', guildMemberAdd],
  ['inviteCreate', inviteCreate],
])

function ready() {
  client.guilds.fetch(mainGuild).then((guild) =>
    guild.invites.fetch().then((invites) => {
      console.log('Novos convites foram salvos.')
      invites.each((invite) => inviteCodeUses.set(invite.code, invite.uses))
      guildInvites.set(mainGuild, inviteCodeUses)
      console.log(guildInvites)
    }),
  )
}

async function guildMemberAdd() {
  const cachedInvites = guildInvites.get(this.guild.id)
  const newInvites = await this.guild.invites.fetch()

  const memberCount = this.guild.memberCount
  try {
    const usedInvite = newInvites.find(
      (inv) => cachedInvites.get(inv.code) < inv.uses,
    )
    console.log('Cached', [...cachedInvites.keys()])
    console.log(
      'New',
      [...newInvites.values()].map((inv) => inv.code),
    )
    console.log('Used', usedInvite)

    this.guild.channels.cache
      .get(loginoutChannel)
      .send(
        `🟩 O usuário ${Formatters.userMention(
          this.user.id,
        )} entrou através do código de convite \`${
          usedInvite.code
        }\`, gerado por ${Formatters.userMention(
          usedInvite.inviterId,
        )}. Agora somos ${Formatters.bold(memberCount)}.`,
      )
  } catch (err) {
    console.log(err)
  }

  newInvites.each((inv) => cachedInvites.set(inv.code, inv.uses))
  guildInvites.set(this.guild.id, cachedInvites)
}

function inviteCreate(invite) {
  console.log('Novo convite salvo.')
  inviteCodeUses.set(invite.code, invite.uses)
  guildInvites.set(mainGuild.id, inviteCodeUses)
  console.log(guildInvites)
}
