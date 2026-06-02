'use strict';
const passwordHash = require('password-hash');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = passwordHash.generate('admin123');
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin Orvix',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isSeller: false,
        warningCount: 0,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@orvix.com' }, {});
  }
};
