
// TO DO
//const mainGuild;
//const guildInvites;
//const loginoutChannel;
//const memberCount;
//const observerRole;
//const cachedInvites;
//const newInvites; 

//on the ready event
mainGuild.invites.fetch().then(invites => {
    console.log('Novos convites foram salvos.');
    const inviteCodeUses = new Map();
    invites.each(invite => inviteCodeUses.set(invite.code, invite.uses));

    guildInvites.set(mainGuild.id, inviteCodeUses);
    console.log(guildInvites);
});

// On inviteCreate Event

console.log('Novo convite salvo.');
const inviteCodeUses = new Map();
inviteCodeUses.set(invite.code, invite.uses);
guildInvites.set(mainGuild.id, inviteCodeUses);
console.log(guildInvites);


//On the join event
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