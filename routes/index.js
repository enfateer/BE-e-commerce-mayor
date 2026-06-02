const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const serviceRoutes = require('./service.routes');
const packageRoutes = require('./package.routes');
const packageByIdRoutes = require('./packageById.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');
const exportRoutes = require('./export.routes');
const notificationRoutes = require('./notification.routes');
const sellerRoutes = require('./seller.routes');
const sellerDetailRoutes = require('./sellerDetail.routes');

const upload = require('../middlewares/upload.middleware');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', upload.none(), categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', upload.none(), orderRoutes);
router.use('/admin', upload.none(), adminRoutes);
router.use('/export', exportRoutes);
router.use('/notifications', upload.none(), notificationRoutes);
router.use('/seller', sellerRoutes);
router.use('/sellers', sellerDetailRoutes);
router.use('/packages', packageByIdRoutes);

module.exports = router;
