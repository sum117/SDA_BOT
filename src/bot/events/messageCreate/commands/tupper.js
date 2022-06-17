const { Message } = require('discord.js')
const tuppers = require('../../../db.js').tuppers
const charCache = new Map()

const regex = [/^!c(riar|reate)?$/m, /^!d(el)?(ete|etar)?$/m, /^!l(ista?)?$/m]
module.exports = {
  type: 'prefixless',
  name: 'Tupper Functions for SDA-BOT',
  description:
    'Um Wrapper com funções Tupper para o SDA-BOT. Contém os comandos `!criar`, `!deletar` e `!lista`. ',

  /**@param {Message} msg A mensagem que foi enviada no servidor. */
  async execute(msg) {
    let args = msg.content.slice(1).split('\n')
    args.shift()
    const content = msg.content
    switch (content) {
      case content.match(regex[0])?.input:
        if (args.length != 3)
          return msg.reply(
            '❌ Uso incorreto. Separe os argumentos com quebras de linha.\nEx: prefixo\nnome\nlink de thumbnail',
          )
        if (!args[2].match(/^http?s/)) return
        const created = await tuppers.create({
          userID: BigInt(msg.author.id),
          prefix: args[0],
          name: args[1],
          thumbnail: args[2],
        })
        if (created)
          msg.reply({
            content: `✅ Tupper de prefixo ${args[0]}, nome ${args[1]} criado com sucesso.`,
            files: [args[2]],
          })
        break
      case content.match(regex[1])?.input:
        if (args.length != 1)
          return msg.reply(
            '❌ Você deve informar apenas o prefixo do personagem a ser deletado. Se tiver mais de um com o mesmo prefixo, ambos serão deletados.',
          )
        const deleted = await tuppers.destroy({
          where: { userID: BigInt(msg.author.id), prefix: args[0] },
        })
        if (deleted) msg.reply('✅ Tupper deletado com sucesso.')
        else
          msg.reply('❌ Não há tuppers com esse prefixo registrado no seu id.')
        break
      case content.match(regex[2])?.input:
        const list = await tuppers.findAll({
          where: { userID: BigInt(msg.author.id) },
        })
        const array = list.map((tupper) => `${tupper.prefix} => ${tupper.name}`)

        if (!array)
          return msg.reply('❌ Não há tupper algum registrado no seu usuário.')

        msg.reply(
          `📁 Todos os tuppers registrados no seu usuário:\n\n${array.join(
            '\n',
          )}`,
        )
        break
      default:
        const tupperMsg = await tuppers.findOne({
          where: {
            userID: BigInt(msg.author.id),
            prefix: content.split(' ')[0],
          },
          logging: false,
        })
        if (!tupperMsg) return
        if (!tupperMsg.prefix) return
        msg.delete().catch(err => console.log(err))
        if (!charCache.get(msg.author.id)) {
          msg.channel
            .createWebhook(tupperMsg.name, {
              avatar: tupperMsg.thumbnail,
            })
            .then((webhook) => {
              charCache.set(msg.author.id, webhook)
              webhook.send(msg.content.slice(tupperMsg.prefix.length))
            })
        } else {
          const char = charCache.get(msg.author.id)
          if (char.channelId != msg.channel.id) {
            msg.channel
              .createWebhook(tupperMsg.name, {
                avatar: tupperMsg.thumbnail,
              })
              .then((webhook) => {
                charCache.set(msg.author.id, webhook)
                webhook.send(msg.content.slice(tupperMsg.prefix.length))
              })
          } else char.send(msg.content.slice(tupperMsg.prefix.length))
        } 

        break
    }
  },
}
