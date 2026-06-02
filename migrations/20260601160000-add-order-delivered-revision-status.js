'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
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

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY status ENUM(
        'pending',
        'accepted',
        'rejected',
        'in_progress',
        'completed',
        'cancelled'
      ) NOT NULL DEFAULT 'pending'
    `);
  },
};
