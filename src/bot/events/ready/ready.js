const {mainGuild} = require('../../../../config.json');
const {memberCountChannel} = require('../../../../config.json').channels;
const {client} = require('../../index');
const tuppers = require('../../db').tuppers;
const {activityCache} = require('../../index');
module.exports = {
    name: 'ready', 
    async execute() {
        tuppers.sync()
        //Set interaction Commands
        client.guilds.cache.get(mainGuild).commands.set([])

        //Update Member Counter
        setInterval(() => {
            const memberCounter = client.guilds.cache.get(mainGuild).channels.cache.get(memberCountChannel);
            activityCache.forEach((time, user) => {
                if(Date.now() - time > 8 * 3600 * 1000) activityCache.delete(user);
            });
            memberCounter.edit({name: memberCounter.name.replace(/\d+/, activityCache.size)})
        }, 5 * 60 * 1000)
    }
}