'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' });
      Order.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
      Order.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
      Order.belongsTo(models.ServicePackage, { foreignKey: 'packageId', as: 'package' });
    }
  }

  Order.init(
    {
      buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      packageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'accepted',
          'rejected',
          'in_progress',
          'delivered',
          'completed',
          'cancelled'
        ),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
    }
  );

  return Order;
};
