const { Client, GuildMember, Formatters, MessageAttachment, } = require('discord.js');
const { user } = require('pg/lib/defaults');
const client = new Client({ intents: 32767 });
const config = require('../../config.json');
const database = require('./db');


/**
 * Quando o bot liga salva todos os novos convites gerados.
 */
const guildInvites = new Map(); // Mapa para guardar o ID do servidor e os usos dos invites.
let mainGuild; //A guilda principal do servidor.
let loginoutChannel; // Canal para log de entrada-saída de membros.
client.once('ready', () => {

    mainGuild = client.guilds.cache.get('976870103125733388');
    loginoutChannel = mainGuild.channels.cache.get('977087066129174538');

    mainGuild.invites.fetch().then(invites => {
        console.log('Novos convites foram salvos.');
        const inviteCodeUses = new Map();
        invites.each(invite => inviteCodeUses.set(invite.code, invite.uses));

        guildInvites.set(mainGuild.id, inviteCodeUses);
        console.log(guildInvites);
    })
});

/**
 * Envia uma mensagem quando o usuário entra no servidor.
 * @param {GuildMember} member Membro que entrou no servidor recentemente.
 * @param {number} memberCount Número de membros do servidor.
 * @param {number} observerRole Cargo padrão concedido aos membros que entram no servidor.
 * @param {Map} cachedInvites Mapa  criado através do guildInvites apenas com o ID da guilda onde o membro novo entrou para guardar o ID do servidor e os usos dos invites.
 * @param {Collection} newInvites Coleção de invites do servidor.
 * @param {object} usedInvite Objeto da coleção newInvites que foi utilizado pelo jogador que entrou no servidor.
 * 
 * @returns {Promise} Retorna uma mensagem com o nome de quem entrou, convite e o sujeito que o gerou no canal de loginout. Além disso, adiciona uma role padrão.
 */
client.on('guildMemberAdd', async member => {

    const cachedInvites = guildInvites.get(member.guild.id); 
    const newInvites = await member.guild.invites.fetch();

    const memberCount = member.guild.memberCount;

    const observerRole = '978807372002754600';
    await member.roles.add(observerRole);

    try {
        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code) < inv.uses);
        console.log("Cached", [...cachedInvites.keys()]);
        console.log("New", [...newInvites.values()].map(inv => inv.code));
        console.log("Used", usedInvite);

        loginoutChannel.send(`🟩 O usuário ${Formatters.userMention(member.user.id)} entrou através do código de convite \`${usedInvite.code}\`, gerado por ${Formatters.userMention(usedInvite.inviterId)}. Agora somos ${Formatters.bold(memberCount)}.`);
    } catch (err) {
        console.log(err);
    };

    newInvites.each(inv => cachedInvites.set(inv.code, inv.uses));
    guildInvites.set(member.guild.id, cachedInvites);
});


const presentationRole = '979506584772288562'; // Cargo de apresentações.
const presentationChannel = '977096309884473344'; // Canal de apresentações.
const generalChannel = '977081396839448596'; // Canal geral.
const mediaChannel = '977083633435279390'; // Canal de mídia.
/**
 * Evento de criação de mensagens.
 * @param {Object} msg A mensagem que foi postada.
 * @returns {Object} O objeto da mensagem.
 */
client.on('messageCreate', msg => {
    
    /**
     * Essa script administra as apresentações do servidor SDA.
     */
    if (msg.channel.id === presentationChannel) {

        database.presentation.create({
            userID: BigInt(msg.author.id),
            msgID: BigInt(msg.id),
        }).then(() => {

            msg.guild.members.fetch(msg.author.id).then((member) => member.roles.add(presentationRole));

            msg.reply(`Sua apresentação foi registrada com sucesso, ${Formatters.userMention(msg.author.id)} e você ganhou o cargo ${Formatters.roleMention(presentationRole)}`)
            .then( (msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(err => console.log('Erro, a mensagem não existe: ' + err));

        }).catch(err => {

            if(err.name === 'SequelizeUniqueConstraintError') msg.reply({
                ephemeral: true,
                content: `Você já se apresentou. Por favor, não escreva mais nada neste canal.`
            }).then((msgObj) => setInterval(() => msgObj.delete(), 10000)).catch(msgErr => console.log('Erro, a mensagem não existe: ' + msgErr));

        });

    /**
     * Essa script administra as imagens e links enviados em canais errados. 
     */
    } else if (msg.channel.id === generalChannel && msg.attachments.size >= 1) {
        setInterval(() => {
            msg.attachments.forEach(attachment => {
                const media = new MessageAttachment(attachment.url);

                msg.guild.channels.cache.get(mediaChannel).send({
                    content: `Imagem enviada em ${Formatters.channelMention(generalChannel)} por ${Formatters.userMention(msg.author.id)}`,
                    attachments: [media]
                })
                .then(mediaMsg => {BulkEmoji(mediaMsg, ['✅', '❌']);}).catch(err => console.log('Não consegui reagir a mensagem: ' + err))
                .then(() => msg.delete()).catch(err => console.log('Erro, a mensagem não existe: ' + err));
            });

        }, 60 * 1000);
    };

});

/**
 * Envia uma mensagem na hora que o usuário sai do servidor e deleta a apresentação dele do chat de apresentações.
 * @param {GuildMember} member Membro que saiu da guilda.
 */
 client.on('guildMemberRemove', member => {

    database.presentation.findOne({where: {userID: BigInt(member.id)}})
        .then(presentation => {
        member.guild.channels.fetch(presentationChannel)
            .then( (channel) => channel.messages.delete(presentation.get('msgID') ) ).catch(err => console.log('Erro, a mensagem de apresentação não existe: ' + err));
        });

    loginoutChannel.send(`🟥 O usuário ${member.user.username}, de ID ${member.id} com \`${msToTime(Date.now() - member.joinedTimestamp)}\` de servidor saiu.`);
});

client.login(config.token);

// Minhas funções pra facilitar o meu trabalho.

/**
 * Função para converter milissegundos em duração.
 * @param {number} ms Tempo em milisegundos.
 * @returns Retorna o tempo formatado em duração humanamente legível.
 */
function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) return seconds + " Segundos";
    else if (minutes < 60) return minutes + " Minutos";
    else if (hours < 24) return hours + " Horas";
    else return days + " Dias"
}
/**
 * Função para adicionar multiplas reações em uma mensagem.
 * @param {Object} msg O objeto da mensagem que será reagida.
 * @param {Array} emojiArray Os emojis que serão usados para reagir.
 * @example bulkEmoji(msg, ['✅', '❌']) // Irá reagir duas vezes à mensagem, com os dois emojis enviados.
 * @returns {Promise} O objeto da reação da mensagem.
 */
function BulkEmoji(msg, Array) {
    let i = 1;
    for (each of Array) {setInterval( () => {msg.react(each); i++;}, i * 2000)}; 
}
  