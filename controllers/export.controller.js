const { Order, User, Service, ServicePackage } = require('../models');

const orderInclude = [
  { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
  { model: Service, as: 'service', attributes: ['title'] },
  { model: ServicePackage, as: 'package', attributes: ['name', 'price', 'deliveryTime'] },
];
const ExcelJS = require('exceljs');
const { response } = require('../helpers/response.formatter');
const {
  canAccessOrder,
  getOrderServiceTitle,
  getOrderPackageName,
  getOrderPackagePrice,
  getBuyerName,
  formatIdr,
  formatDate,
} = require('../helpers/export.helpers');
const { buildOrderListWhere } = require('../helpers/order-query.helpers');
const { buildOrderDetailPdf, buildOrdersListPdf } = require('../helpers/pdf.builder');

const sendPdf = (res, buffer, filename) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
};

const sendExcel = async (res, workbook, filename) => {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  downloadOrderDetailPDF: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, { include: orderInclude });

      if (!order) {
        return res.status(404).json(response(404, 'Order not found'));
      }

      if (!canAccessOrder(order, req.user)) {
        return res.status(403).json(response(403, 'Unauthorized'));
      }

      const buffer = await buildOrderDetailPdf(order.get({ plain: true }));
      sendPdf(res, buffer, `order-${order.id}.pdf`);
    } catch (err) {
      console.error('PDF order detail error:', err);
      if (!res.headersSent) {
        return res.status(500).json(response(500, 'Gagal membuat PDF', err.message));
      }
    }
  },

  downloadCompletedOrdersPDF: async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: buildOrderListWhere(req.user),
        include: orderInclude,
        order: [['createdAt', 'DESC']],
      });

      const plainOrders = orders.map((o) => o.get({ plain: true }));
      const title =
        req.user.role === 'admin'
          ? 'ORVIX — Semua Order'
          : 'ORVIX — Riwayat Order Saya';

      const buffer = await buildOrdersListPdf(plainOrders, title);
      sendPdf(res, buffer, 'orders-history.pdf');
    } catch (err) {
      console.error('PDF orders history error:', err);
      if (!res.headersSent) {
        return res.status(500).json(response(500, 'Gagal membuat PDF', err.message));
      }
    }
  },

  exportSellerOrdersExcel: async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: { sellerId: req.user.id },
        include: orderInclude,
        order: [['createdAt', 'DESC']],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales History');

      worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 10 },
        { header: 'Buyer Name', key: 'buyerName', width: 22 },
        { header: 'Buyer Email', key: 'buyerEmail', width: 28 },
        { header: 'Service Title', key: 'service', width: 30 },
        { header: 'Package', key: 'package', width: 15 },
        { header: 'Revenue (Rp)', key: 'price', width: 16 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Created', key: 'date', width: 22 },
      ];

      worksheet.getRow(1).font = { bold: true };

      orders.forEach((order) => {
        worksheet.addRow({
          id: order.id,
          buyerName: getBuyerName(order),
          buyerEmail: order.buyer?.email || '-',
          service: getOrderServiceTitle(order),
          package: getOrderPackageName(order),
          price: Number(getOrderPackagePrice(order)) || 0,
          status: order.status,
          date: formatDate(order.createdAt),
        });
      });

      await sendExcel(res, workbook, 'seller-orders.xlsx');
    } catch (err) {
      console.error('Excel export error:', err);
      if (!res.headersSent) {
        return res.status(500).json(response(500, 'Gagal membuat Excel', err.message));
      }
    }
  },
};
