const getColors = require('get-image-colors');
module.exports = {
    type: 'prefix',
    prefix: 'embed',
    execute(msg) {

        return new Promise(resolve => {
            const content = msg.content

            if (content.includes(this.prefix)) {

                const args = content.split('\n');
                const parsed = args.shift();

                if (parsed === this.prefix) {
                    /**
                     * @type {Array<String>}
                     * @var unparsedTitle O título do Embed que virá do nome do canal.
                     */
                    let unparsedTitle = msg.channel.name.split('-');
                    /**@type {Array<String>} @var parsedTitle Array que virá da função ForEach com a string capitalizada.*/
                    let parsedTitle = [];
                    unparsedTitle.forEach((word) => {
                        if (word.match(/^d((o|a)s?|e)$/)) return parsedTitle.push(word);

                        const newWord = word.charAt(0).toUpperCase() + word.slice(1);
                        return parsedTitle.push(newWord);
                    });

                    const link = args.pop();
                    if (!link.includes('http')) throw new Error('Você não informou um link no último elemento do parâmetro.');

                    const color = () => getColors(link).then(color => color.map(color => color.hex())[0]);
                    let embed = new MessageEmbed()
                        .setTitle(parsedTitle.join(' '))
                        .setDescription(args.join('\n'))
                        .setImage(link)
                        .setAuthor({
                            iconURL: msg.guild.iconURL({ dynamic: true, size: 1024 }),
                            name: msg.channel.parent.name.slice(1).replace(/\| RP/, '')
                        })
                        .setFooter({
                            text: '💡 Quer dar uma nova descrição ao canal? Contate os Admins!'
                        });
                    color().then(color => {
                        embed.setColor(color)
                        resolve(msg.channel.send({
                            content: 'Descrição atual produzida por ' + Formatters.userMention(msg.author.id),
                            embeds: [embed]
                        }));
                    })
                }
            }
        });
    }
}