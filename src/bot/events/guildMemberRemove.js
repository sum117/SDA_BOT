const database = require('../db');
const { msToTime } = require("../functions");
const { client, presentationChannel} = require("..");

/**
 * Envia uma mensagem na hora que o usuário sai do servidor e deleta a apresentação dele do chat de apresentações.
 * @param {GuildMember} member Membro que saiu da guilda.
 */
module.exports = {
    name: 'guildMemberRemove', 
    async execute (member) {
        const loginoutChannel = await member.guild.channels.fetch('977087066129174538');

        database.presentation.findOne({ where: { userID: BigInt(member.id) } })
            .then(presentation => {
                member.guild.channels.fetch(presentationChannel)
                    .then((channel) => channel.messages.delete(presentation.get('msgID'))).catch(err => console.log('Erro, a mensagem de apresentação não existe: ' + err));
            });

        loginoutChannel.send(`🟥 O usuário ${member.user.username}, de ID ${member.id} com \`${msToTime(Date.now() - member.joinedTimestamp)}\` de servidor saiu.`);
    }
}
