const config = require('../../config.json')
const Sequelize = require('sequelize')
const database = new Sequelize(config.database.name,config.database.user, config.database.password, {
    host: 'localhost',
    dialect: 'postgres',
})

const presentation = database.define('presentation', {
    userID: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
    },
    msgID: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
});

module.exports = {presentation}

