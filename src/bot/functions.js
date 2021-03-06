const {Modal, TextInputComponent, MessageActionRow, MessageSelectMenu} = require('discord.js');
// Minhas funções pra facilitar o meu trabalho.
/**
 * Função para converter milissegundos em duração.
 * @param {number} ms Tempo em milisegundos.
 * @returns {string} Retorna o tempo formatado em duração humanamente legível.
 */
function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1)
  let minutes = (ms / (1000 * 60)).toFixed(1)
  let hours = (ms / (1000 * 60 * 60)).toFixed(1)
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1)

  if (seconds < 60) return seconds + ' Segundos'
  else if (minutes < 60) return minutes + ' Minutos'
  else if (hours < 24) return hours + ' Horas'
  else return days + ' Dias'
}
/**
 * Função para adicionar multiplas reações em uma mensagem.
 * @param {Object} msg O objeto da mensagem que será reagida.
 * @param {Array} emojiArray Os emojis que serão usados para reagir.
 * @example bulkEmoji(msg, ['✅', '❌']) // Irá reagir duas vezes à mensagem, com os dois emojis enviados.
 * @returns {Promise} O objeto da reação da mensagem.
 */
function BulkEmoji(msg, Array) {
  for (each of Array) msg.react(each)
}
/**
 * @author sum#0117 <github.com/sum117>
 * @license MIT
 * @function clearMessages Função para limpeza em massa de mensagens do Discord que já estão velhas.
 * @param {!TextChannel} channel O canal onde a função será executada.
 * @param {{limit?: number, before?: number, after?: number, around?: number, images?: boolean}=} options Opções de remoção.
 *
 * @returns {Promise<string>} `Canais` deletados.
 */
function clearMessages(channel, options) {
  /**
   * @constant progressMessage - Mensagem enviada quando a função é iniciada.
   */
  const progressMessage = channel.send(
    `Iniciando varredura. Aguarde, isso pode demorar um pouco...\n⏲️ [🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥] 0%\n${Formatters.bold(
      'NÃO DELETE ESTA MENSAGEM.',
    )}`,
  )

  /** @var fullCount - Número total de mensagens a serem deletadas. */
  let total = 0
  let current = 0
  const startTime = Date.now()
  return new Promise((resolve) => {
    if (!channel) throw new Error('O canal enviado não é válido')

    progressMessage.then((pmsg) => {
      channel.messages
        .fetch({
          limit: options?.limit || undefined,
          before: options?.before || undefined,
          after: options?.after || undefined,
          around: options?.around || undefined,
        })
        .then((collection) => {
          let regex = pmsg.content.match(/🟥/g)
          let bool = (m) => m.id != pmsg.id
          if (options?.images) {
            bool = (m) => {
              if (!(m.attachments.size >= 1 || m.content.match(/https?/g))) {
                if (m.id != pmsg.id) {
                  return true
                }
              } else {
                return resolve('Não há mensagens para serem deletadas.')
              }
            }
          }
          collection.filter(bool).forEach((msg) => {
            total++
            setTimeout(() => {
              current++

              if (!pmsg)
                throw new Error(
                  'A mensagem de progresso foi deletada ou é inválida.',
                )
              progressBar(pmsg)

              //Deletando as mensagens.
              msg.delete().catch((err) => console.log(err))
              if (current >= total)
                return resolve(
                  `Processo finalizado. Foram deletadas ${total} mensagens. Duração ${msToTime(
                    Date.now() - startTime,
                  )}`,
                )
            }, total * 10 * 1000)
          })
        })
    })
  })
  /**
   * @function progressBar A simple progress bar.
   * @author Milo123459<https://github.com/Milo123459>
   * @description This progress bar logic was copied from <https://github.com/Sparker-99/string-progressbar/blob/master/index.js>, a NPM package by Sparker-99.
   */
  function progressBar(pmsg) {
    let percentage = current / total
    let progress = Math.round(10 * percentage)
    let emptyProgress = 10 - progress
    let progressText = '🟩'.repeat(progress)
    let emptyProgressText = '🟥'.repeat(emptyProgress)
    let bar = progressText + emptyProgressText
    let calculated = Math.round(percentage * 100)
    let newMsg = pmsg.content.replace(/\[.*\]\s\d+%/, `[${bar}] ${calculated}%`)
    pmsg.edit(newMsg)
  }
}
/**
 * @description Uma função para criar um formulário de criação de personagens, feita para preservar espaço em outros arquivos.
 * @param {BaseCommandInteraction} interaction A interação que gerará o formulário.
 * @returns {Modal} Retorna um formulário para preenchimento.
 */
function createForm() {
  const form = new Modal().setCustomId('ficha').setTitle('Ficha de Personagem')

  let optionsArray = []
  const persoNome = new TextInputComponent()
    .setRequired(true)
    .setCustomId('persoNome')
    .setLabel('Nome do Personagem')
    .setStyle('SHORT')
    .setPlaceholder('Não use títulos aqui. Ex: "Eli, Senhor dos Trovões"')
    .setMaxLength(128)
  optionsArray.push(persoNome)

  const persoPersonalidade = new TextInputComponent()
    .setRequired(true)
    .setCustomId('persoPersonalidade')
    .setLabel('Personalidade')
    .setStyle('PARAGRAPH')
    .setPlaceholder('Seja Interessante...')
    .setMaxLength(4000)
  optionsArray.push(persoPersonalidade)

  const persoFisico = new TextInputComponent()
    .setRequired(true)
    .setCustomId('persoFisico')
    .setLabel('Características Físicas')
    .setStyle('PARAGRAPH')
    .setPlaceholder('Peso, Altura, Aparência geral e etc...')
    .setMaxLength(4000)
  optionsArray.push(persoFisico)

  const persoPoder = new TextInputComponent()
    .setRequired(true)
    .setCustomId('persoPoder')
    .setLabel('Poder')
    .setStyle('PARAGRAPH')
    .setPlaceholder('Seja o menos subjetivo possível...')
    .setMaxLength(4000)
  optionsArray.push(persoPoder)

  const persoImagem = new TextInputComponent()
    .setRequired(true)
    .setCustomId('persoImagem')
    .setLabel('Link de Imagem')
    .setStyle('SHORT')
    .setPlaceholder(
      'Envie apenas links, nada mais. Ex: https://sda.com/imagem.png',
    )
    .setMaxLength(500)
  optionsArray.push(persoImagem)

  optionsArray.forEach((field) => {
    const actionRow = new MessageActionRow().addComponents(field)
    form.addComponents(actionRow)
  })

  return form
}
/**
 * @description Função para gerar seletor de personagens feita para economizar espaço em outros arquivos.
 * @returns {MessageActionRow} Retorna uma array de action rows com três seletores para a ficha de personagem;
 */
function createCharSelectors() {
  const selectors = [
    new MessageSelectMenu()
      .setCustomId('soma')
      .setPlaceholder('Escolha a sua Soma')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: 'Soma Austera',
          description: 'Ordem acima da luz, ordem acima de tudo.',
          value: 'austera',
          emoji: '<:Austeros:982077481702027344>',
        },
        {
          label: 'Soma Perserata',
          description: 'Perseverança e gratidão leva a reinício de ciclos.',
          value: 'perserata',
          emoji: '<:Perserata:982078451513184306>',
        },
        {
          label: 'Soma Insanata',
          description: 'Renascimento por meio da morte.',
          value: 'insanata',
          emoji: '<:Insanata:982078436166221874>',
        },
        {
          label: 'Soma Equinócio',
          description: 'Liberdade por entre a tecnologia.',
          value: 'equinocio',
          emoji: '<:Equinocio:982082685889564772>',
        },
        {
          label: 'Soma Oscuras',
          description: 'A lâmina do silêncio é a mais afiada.',
          value: 'oscuras',
          emoji: '<:Oscuras:982082685835051078>',
        },
        {
          label: 'Soma Ehrantos',
          description: 'Evolução através da fé.',
          value: 'ehrantos',
          emoji: '<:Ehrantos:982082685793087578>',
        },
        {
          label: 'Soma Melancus',
          description: 'Sem sofrimento não há redenção.',
          value: 'melancus',
          emoji: '<:Melancus:982082685801472060>',
        },
        {
          label: 'Soma Observata',
          description: 'Testemunha o mundo ao redor se ajoelhar perante a ti.',
          value: 'observata',
          emoji: '<:Observata:982082685864378418>',
        },
        {
          label: 'Soma Invidia',
          description: 'As mãos da justiça estão sempre sujas de sangue ímpio.',
          value: 'invidia',
          emoji: '<:Invidia:982082685503696967>',
        },
      ]),
    new MessageSelectMenu()
      .setCustomId('genero')
      .setDisabled(true)
      .setPlaceholder('Escolha seu Gênero')
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions([
        {
          label: 'Masculino',
          description: 'Foi somado à Imprevia com genitalia masculina.',
          value: 'masculino',
          emoji: '♂️',
        },
        {
          label: 'Feminino',
          description: 'Foi somado à Imprevia com genitalia feminina.',
          value: 'feminino',
          emoji: '♀️',
        },
        {
          label: 'Descubra',
          description: 'O que eu deveria colocar aqui mesmo...?',
          value: 'genderless',
          emoji: '👽',
        },
      ]),
    new MessageSelectMenu()
      .setCustomId('purgatorio')
      .setDisabled(true)
      .setPlaceholder('Escolha seu Purgatório')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: 'Fantasma Azul',
          description:
            'Uma nova chance ao ajudar na morte de uma criatura forte.',
          value: 'azul',
          emoji: '<:fantasmaAzul:982092065523507290>',
        },
        {
          label: 'Fantasma Vermelho',
          description: 'Uma nova chance com a morte do Subtrato.',
          value: 'vermelho',
          emoji: '<:fantasmaVermelho:982092065989074994>',
        },
        {
          label: 'Fantasma Branco',
          description: 'Uma nova chance através de favores.',
          value: 'branco',
          emoji: '<:fantasmaBranco:982092065599029268>',
        },
      ]),
  ]
  const actionRows = selectors.map((field) =>
    new MessageActionRow().addComponents(field),
  )
  return actionRows
}
/**
 * @description Salva as últimas mensagens de um canal pra um arquivo de texto.
 * @param {Message} msg mensagem que receberá uma resposta com o resultado da função.
 * @param {number?} channelId o id do canal onde o buffer deve ser enviado.
 */
async function saveToFile(msg, channelId) {
  let msgs = await msg.channel.messages.fetch({ limit: 100 })
  let array = msgs
    .reverse()
    .filter((msg) => msg != msgs.last())
    .map((msg) => `${msg.author.username}: ${msg.content}`)
  const file = Buffer.from(array.join('\n\n'))
  const response = await msg.guild.channels.cache
    .get(channelId ?? msg.channel.id)
    .send({
      content: `Salvei todas as mensagens de ${Formatters.channelMention(
        msg.channel.id,
      )} que consegui encontrar e coloquei dentro deste arquivo...`,
      files: [
        {
          attachment: file,
          name: 'save.txt',
          description: 'Compilado das últimas mensagens do canal.',
        },
      ],
    })
  return response
}
/**
 * 
 * @param {string} str A string a ser capitalizada.
 * @returns uma string em formato de titulo.
 */
function title (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
module.exports = {BulkEmoji, clearMessages, createForm, createCharSelectors, msToTime, saveToFile, title}; 
