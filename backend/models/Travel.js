const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); // Kullanıcı modelini içeri alıyoruz

const Travel = sequelize.define('Travel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pnr: {
        type: DataTypes.STRING,
        allowNull: true
    },
    checklist: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // 🔗 İLİŞKİ ALANI: Seyahatin hangi kullanıcıya ait olduğunu tutar
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

// Sequelize İlişki Tanımlamaları (One-to-Many)
User.hasMany(Travel, { foreignKey: 'userId', onDelete: 'CASCADE' });
Travel.belongsTo(User, { foreignKey: 'userId' });

module.exports = Travel;