'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hapus kolom revisions dari service_packages jika ada.
    await queryInterface.removeColumn('service_packages', 'revisions');
  },

  async down (queryInterface, Sequelize) {
    // Kembalikan kolom revisions (default 1) bila rollback.
    await queryInterface.addColumn('service_packages', 'revisions', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
    });
  }
};
