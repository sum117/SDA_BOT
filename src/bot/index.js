const { Client, Formatters } = require('discord.js')
const client = new Client({ intents: 32767 })
exports.client = client
const config = require('../../config.json')
const activityCache = new Map()
exports.activityCache = activityCache

//Event Handler
const fs = require('fs')

const events = new Map()
fs.readdirSync(`${__dirname}/events`)
  .filter((not) => !not.includes('commandSystems'))
  .forEach((event) => {
    const module = require(`./events/${event}/${event}`)
    events.set(event, { name: module.name, execute: [module.execute] })
  })
fs.readdirSync(`${__dirname}/events/commandSystems`).forEach((system) => {
  const module = require(`./events/commandSystems/${system}`)

  for (let [k, v] of module) {
    if (!events.has(k)) events.set(k, { name: k, execute: [v] })
    else {
      let funcArray = events.get(k).execute
      funcArray.push(v)
      events.set(k, { name: k, execute: funcArray })
    }
  }
})

for (let [k, v] of events) {
  client.on(k, (...args) => {
    v.execute.forEach((func) => {
      func.apply(...args)
    })
  })
}


//Error Handler
client.on('error', e => {
  handleError(e)
})
process.on('unhandledRejection', e => {
  handleError(e)
})

function handleError(e) {
  client.guilds.cache.first()
  .channels.fetch(config.channels.errorChannel)
    .then(chn => {
      chn.send(`⚠️ERRO DO BOT! ${Formatters.userMention(config.sum117)}\n\nNome: ${e.name}\nMensagem: ${e.message}\nStack: ${e.stack}`)
    })
}

client.login(config.token)
