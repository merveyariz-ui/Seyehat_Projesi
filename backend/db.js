const { Sequelize } = require('sequelize');

// SQLite Bağlantısını burada bağımsız olarak tanımlıyoruz
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

module.exports = sequelize;