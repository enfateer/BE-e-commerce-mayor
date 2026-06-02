const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const sellerMiddleware = require('../middlewares/seller.middleware');

router.use(authMiddleware);

// Buyer Routes
router.get('/orders/:id/pdf', exportController.downloadOrderDetailPDF);
router.get('/orders/history/pdf', exportController.downloadCompletedOrdersPDF);

// Seller Routes
router.get('/seller/orders/excel', sellerMiddleware, exportController.exportSellerOrdersExcel);

module.exports = router;
