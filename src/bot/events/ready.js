const database = require('../db');
const { client, guildInvites } = require("..");

module.exports = {
    name: 'ready', 
    async execute() {
        const mainGuild = client.guilds.cache.first();
        database.presentation.sync();

        mainGuild.invites.fetch().then(invites => {
            console.log('Novos convites foram salvos.');
            const inviteCodeUses = new Map();
            invites.each(invite => inviteCodeUses.set(invite.code, invite.uses));

            guildInvites.set(mainGuild.id, inviteCodeUses);
            console.log(guildInvites);
        });
    }
}