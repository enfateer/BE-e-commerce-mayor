'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Service.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Service.hasMany(models.ServicePackage, { foreignKey: 'serviceId', as: 'packages' });
      Service.hasMany(models.Order, { foreignKey: 'serviceId', as: 'orders' });
    }
  }

  Service.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Service',
      tableName: 'services',
      timestamps: true,
    }
  );

  return Service;
};
