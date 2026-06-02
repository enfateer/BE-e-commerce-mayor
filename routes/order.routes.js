const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderDetail);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateStatus);

module.exports = router;
