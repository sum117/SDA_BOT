module.exports = {
  name: 'interactionCreate',
  async execute() {
    const fs = require('fs')
    const commands = fs
      .readdirSync(`${__dirname}/src/bot/events/interactionCreate/commands`)
      .filter((file) => file.endsWith('.js'))
    for (each of commands) {
      const used = require(`./commands/${each}`)
      if (this.type === used.type) {
        used.execute(this)
      }
    }
  },
}
