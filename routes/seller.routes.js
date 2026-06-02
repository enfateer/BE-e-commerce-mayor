const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const sellerMiddleware = require('../middlewares/seller.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authMiddleware);
router.use(sellerMiddleware);

router.get('/dashboard', upload.none(), orderController.getSellerDashboard);

module.exports = router;
