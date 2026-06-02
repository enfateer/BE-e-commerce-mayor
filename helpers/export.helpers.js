const formatIdr = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 'Rp 0';
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getOrderServiceTitle = (order) =>
  order?.service?.title || order?.Service?.title || '-';

const getOrderPackageName = (order) =>
  order?.package?.name || order?.Package?.name || '-';

const getOrderPackagePrice = (order) =>
  order?.package?.price ?? order?.Package?.price ?? 0;

const getBuyerName = (order) =>
  order?.buyer?.name || order?.Buyer?.name || '-';

const getSellerName = (order) =>
  order?.seller?.name || order?.Seller?.name || '-';

const canAccessOrder = (order, user) => {
  if (!order || !user) return false;
  if (user.role === 'admin') return true;
  return order.buyerId === user.id || order.sellerId === user.id;
};

module.exports = {
  formatIdr,
  formatDate,
  getOrderServiceTitle,
  getOrderPackageName,
  getOrderPackagePrice,
  getBuyerName,
  getSellerName,
  canAccessOrder,
};
