const { Formatters } = require('discord.js');

// Minhas funções pra facilitar o meu trabalho.
/**
 * Função para converter milissegundos em duração.
 * @param {number} ms Tempo em milisegundos.
 * @returns {string} Retorna o tempo formatado em duração humanamente legível.
 */
function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60)
        return seconds + " Segundos";
    else if (minutes < 60)
        return minutes + " Minutos";
    else if (hours < 24)
        return hours + " Horas";
    else
        return days + " Dias";
}
exports.msToTime = msToTime;
/**
 * Função para adicionar multiplas reações em uma mensagem.
 * @param {Object} msg O objeto da mensagem que será reagida.
 * @param {Array} emojiArray Os emojis que serão usados para reagir.
 * @example bulkEmoji(msg, ['✅', '❌']) // Irá reagir duas vezes à mensagem, com os dois emojis enviados.
 * @returns {Promise} O objeto da reação da mensagem.
 */
function BulkEmoji(msg, Array) {
    for (each of Array)
        msg.react(each);
}
exports.BulkEmoji = BulkEmoji;
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
    const progressMessage = channel.send(`Iniciando varredura. Aguarde, isso pode demorar um pouco...\n⏲️ [🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥] 0%\n${Formatters.bold('NÃO DELETE ESTA MENSAGEM.')}`);

    /** @var fullCount - Número total de mensagens a serem deletadas. */
    let total = 0;
    let current = 0;
    const startTime = Date.now();
    return new Promise(resolve => {

        if (!channel)
            throw new Error('O canal enviado não é válido');

        progressMessage.then(pmsg => {
            channel.messages.fetch({
                limit: options?.limit || undefined,
                before: options?.before || undefined,
                after: options?.after || undefined,
                around: options?.around || undefined,
            }).then(collection => {
                let regex = pmsg.content.match(/🟥/g);
                let bool = m => m.id != pmsg.id;
                if (options?.images)
                    bool = m => {
                        if (m.attachments.size >= 1) {
                            return true;
                        } else {
                            return resolve(pmsg.edit('Não há mensagens para serem deletadas.'));
                        }
                    };
                collection.filter(bool).forEach(msg => {
                    total++;
                    setTimeout(() => {
                        current++;

                        if (!pmsg)
                            throw new Error('A mensagem de progresso foi deletada ou é inválida.');
                        progressBar(pmsg);

                        //Deletando as mensagens.
                        msg.delete().catch(err => console.log(err));
                        if (current >= total)
                            return resolve(`Processo finalizado. Foram deletadas ${fullCount} mensagens. Duração ${msToTime(Date.now() - startTime)}`);
                    }, total * 10 * 1000);
                });
            });
        });
    });
    /**
     * @function progressBar A simple progress bar.
     * @author Milo123459<https://github.com/Milo123459>
     * @description This progress bar logic was copied from <https://github.com/Sparker-99/string-progressbar/blob/master/index.js>, a NPM package by Sparker-99.
     */
    function progressBar(pmsg) {
        let percentage = current / total;
        let progress = Math.round(10 * percentage);
        let emptyProgress = 10 - progress;
        let progressText = ('🟩').repeat(progress);
        let emptyProgressText = ('🟥').repeat(emptyProgress);
        let bar = progressText + emptyProgressText;
        let calculated = Math.round(percentage * 100);
        let newMsg = pmsg.content.replace(/\[.*\]\s\d+%/, `[${bar}] ${calculated}%`);
        pmsg.edit(newMsg);
    }
}
;
