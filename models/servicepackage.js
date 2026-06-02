'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ServicePackage extends Model {
    static associate(models) {
      ServicePackage.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
      ServicePackage.hasMany(models.Order, { foreignKey: 'packageId', as: 'orders' });
    }
  }

  ServicePackage.init(
    {
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      deliveryTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      features: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ServicePackage',
      tableName: 'service_packages',
      timestamps: true,
    }
  );

  return ServicePackage;
};
