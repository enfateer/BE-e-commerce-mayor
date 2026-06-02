const PDFDocument = require('pdfkit');
const {
  formatIdr,
  formatDate,
  getOrderServiceTitle,
  getOrderPackageName,
  getOrderPackagePrice,
  getBuyerName,
  getSellerName,
} = require('./export.helpers');

const pdfToBuffer = (buildFn) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      buildFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });

const writeOrderDetail = (doc, order) => {
  doc.fontSize(22).text('ORVIX — Order Detail', { align: 'center' });
  doc.moveDown(1.5);
  doc.fontSize(12);

  const rows = [
    ['Order ID', `#${order.id}`],
    ['Status', String(order.status || '-').toUpperCase()],
    ['Service', getOrderServiceTitle(order)],
    ['Package', getOrderPackageName(order)],
    ['Price', formatIdr(getOrderPackagePrice(order))],
    ['Buyer', getBuyerName(order)],
    ['Seller', getSellerName(order)],
    ['Created', formatDate(order.createdAt)],
    ['Updated', formatDate(order.updatedAt)],
  ];

  if (order.requirements?.trim()) {
    rows.push(['Requirements', order.requirements.trim()]);
  }

  rows.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').text(`${label}:`, { continued: true });
    doc.font('Helvetica').text(` ${value}`);
    doc.moveDown(0.4);
  });
};

const writeOrdersList = (doc, orders, title) => {
  doc.fontSize(22).text(title, { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(11);

  if (!orders.length) {
    doc.text('Tidak ada data order.', { align: 'center' });
    return;
  }

  orders.forEach((order, index) => {
    doc.font('Helvetica-Bold').text(`${index + 1}. Order #${order.id}`);
    doc.font('Helvetica');
    doc.text(`   Service: ${getOrderServiceTitle(order)}`);
    doc.text(`   Package: ${getOrderPackageName(order)} · ${formatIdr(getOrderPackagePrice(order))}`);
    doc.text(`   Seller: ${getSellerName(order)} · Status: ${order.status}`);
    doc.text(`   Tanggal: ${formatDate(order.createdAt)}`);
    doc.moveDown(0.6);
  });
};

const buildOrderDetailPdf = (order) =>
  pdfToBuffer((doc) => writeOrderDetail(doc, order));

const buildOrdersListPdf = (orders, title) =>
  pdfToBuffer((doc) => writeOrdersList(doc, orders, title));

module.exports = {
  buildOrderDetailPdf,
  buildOrdersListPdf,
};
