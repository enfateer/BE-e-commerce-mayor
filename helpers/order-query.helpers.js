const { Op } = require('sequelize');

/** Filter daftar order: admin = semua; seller = jual + beli; buyer = pembelian saja. */
const buildOrderListWhere = (user) => {
  if (!user?.id) return { id: -1 };
  if (user.role === 'admin') return {};
  if (user.isSeller) {
    return {
      [Op.or]: [{ sellerId: user.id }, { buyerId: user.id }],
    };
  }
  return { buyerId: user.id };
};

module.exports = { buildOrderListWhere };
