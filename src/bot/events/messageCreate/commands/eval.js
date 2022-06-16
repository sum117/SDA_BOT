module.exports = {
  type: 'prefix',
  prefix: 'eval',
  name: 'Javascript Evaluator',
  description: 'Comando de administrador para executar JS direto do Discord.',
  async execute(msg) {
    /**@type {String} */
    const parsed = msg.content.replace(/(```js|```)/gm, '')
    if (parsed.match(/function\./))
      parsed.replace(/function\./, `require('../../../functions').`)
    eval(parsed)
  },
}
