'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Service, { foreignKey: 'userId', as: 'services' });
      User.hasMany(models.Order, { foreignKey: 'buyerId', as: 'buyerOrders' });
      User.hasMany(models.Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
      User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('buyer', 'admin'),
        defaultValue: 'buyer',
      },
      isSeller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      warningCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    }
  );

  return User;
};
