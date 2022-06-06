const database = require('../db');
const { client, guildInvites, activityCache } = require("..");
const { spawnHentai } = require('../functions');


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
        //Para o slashCommands do akaneko
        mainGuild.commands.set([spawnHentai()])
        //Checar se há membros ativos.
        setInterval(() => {
            const memberCounter = mainGuild.channels.cache.get('977082930402844692');
            activityCache.forEach((time, user) => {
                if(Date.now() - time > 8 * 360 * 1000) activityCache.delete(user);
            });
            memberCounter.edit({name: memberCounter.name.replace(/\d+/, activityCache.size)})
        }, 5 * 60 * 1000)
    }
}