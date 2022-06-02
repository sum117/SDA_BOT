const { Formatters } = require('discord.js');
const { client, guildInvites} = require("..");

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
module.exports = {
    name: 'guildMemberAdd', 
    async execute(member){
        const loginoutChannel = await member.guild.channels.fetch('977087066129174538');

        const cachedInvites = guildInvites.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();

        const memberCount = member.guild.memberCount;

        const observerRole = '981354637338763264';
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
    }
}
