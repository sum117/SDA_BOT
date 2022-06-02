const {guildInvites} = require("..");

module.exports = {
    name: 'inviteCreate', 
    execute(invite) {
        const mainGuild = invite.guild;
        console.log('Novo convite salvo.');
        const inviteCodeUses = new Map();
        inviteCodeUses.set(invite.code, invite.uses);
        guildInvites.set(mainGuild.id, inviteCodeUses);
        console.log(guildInvites);
    }
}