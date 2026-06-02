'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Kolom description dan revisions tidak ditambahkan ulang.
    // Migration ini dibatalkan karena sudah ada di skema database / menyebabkan duplikasi.
    // (Biarkan up/down kosong agar migrasi tidak merusak schema.)
  },

  async down(queryInterface) {
    // down dikosongkan karena up juga tidak melakukan perubahan schema.
    // Ini untuk mencegah remove column yang bisa gagal jika sudah ada/tidak sesuai.
  },
};
