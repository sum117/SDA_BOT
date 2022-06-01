
const Sequelize = require('sequelize')
const database = new Sequelize('sda', 'postgres', 'admin', {
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

module.exports = {
    Sequelize: Sequelize,
    database: database,
    presentation: presentation,
}


