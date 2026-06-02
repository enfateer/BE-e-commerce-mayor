const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const sellerMiddleware = require('../middlewares/seller.middleware');
const upload = require('../middlewares/upload.middleware');

const packageRoutes = require('./package.routes');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceDetail);

// Mount package routes under services
router.use('/:serviceId/packages', packageRoutes);

router.use(authMiddleware);
router.post('/', sellerMiddleware, upload.single('thumbnail'), serviceController.createService);
router.put('/:id', sellerMiddleware, upload.single('thumbnail'), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
