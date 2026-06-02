'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE orders SET status = 'in_progress' WHERE status = 'revision'
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY status ENUM(
        'pending',
        'accepted',
        'rejected',
        'in_progress',
        'delivered',
        'completed',
        'cancelled'
      ) NOT NULL DEFAULT 'pending'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY status ENUM(
        'pending',
        'accepted',
        'rejected',
        'in_progress',
        'delivered',
        'revision',
        'completed',
        'cancelled'
      ) NOT NULL DEFAULT 'pending'
    `);
  },
};
