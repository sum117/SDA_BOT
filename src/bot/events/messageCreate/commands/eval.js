module.exports = {
    type: 'prefix',
    prefix: 'eval',

    execute(msg) {
        /**@type {String} */
        const parsed = msg.content.replace(/(```js|```)/gm, '');
        if(parsed.match(/function\./)) parsed.replace(/function\./, `require('../../../functions').`);
        eval(parsed);
    }
}
