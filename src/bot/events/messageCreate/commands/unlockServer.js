const { entranceChannel, generalChannel } = require('../../../../../config.json').channels
const { botId } = require('../../../../../config.json')
module.exports = {
  type: 'prefixless',
  name: 'Entrance Script',
  description:
    'Desbloqueia o servidor quando o usuário digita o número 18, que corresponde à resposta do questionário.',
  async execute(msg) {
    if (msg.channelId === entranceChannel && msg.author.id != botId) {
      let response
      if (msg.content.match(/18/)) {
        if (!msg.member.roles.cache.has('983190321334726666')) {
          msg.member.roles.add('983190321334726666')
          response = await msg.reply({
            content:
              'Bem vindo ao Somas do Amanhã, ' + msg.author.username + '.',
          })
          msg.guild.channels.cache
            .get(generalChannel)
            .send(
              `${Formatters.userMention(
                msg.author.id,
              )} ganhou acesso à comunidade, ${Formatters.roleMention(
                '977087122345451530',
              )}! Falem com ele!`,
            )
        }
      } else {
        response = await msg.reply({
          content:
            'Você colocou o resultado incorreto. Se acha que isso é um erro, contate um administrador.',
        })
      }
      setTimeout(
        () =>
          msg.delete().catch((err) => {
            console.log(err + ' A mensagem não existe.')
            if (response) response.delete()
          }),
        5 * 1000,
      )
    }
  },
}
