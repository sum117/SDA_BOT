const { activityCache } = require('../../index')
module.exports = {
  name: 'messageCreate',

  async execute() {
    activityCache.set(this.author.id, Date.now())

    const fs = require('fs')
    const commands = fs
      .readdirSync(`${__dirname}/commands`)
      .filter((file) => file.endsWith('.js'))

    // Command Handler
    for (each of commands) {
      let used = require(`./commands/${each}`)
      if (this.content.includes(used.prefix)) {
        try {
          used.execute(this)
        } catch (error) {
          this.reply(
            'Infelizmente este comando deu erro, ou provavelmente não existe: ' +
              error,
          )
        }
      } else if (used.type === 'prefixless') {
        used.execute(this)
      }
    }
  },
}
