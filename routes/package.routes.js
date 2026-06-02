const express = require('express');
const router = express.Router({ mergeParams: true });
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const sellerMiddleware = require('../middlewares/seller.middleware');
const upload = require('../middlewares/upload.middleware');

// Public - Get packages for a service
router.get('/', packageController.getPackagesByService);

// Protected - Create package (nested under /services/:serviceId/packages)
router.post('/', authMiddleware, sellerMiddleware, upload.none(), packageController.createPackage);

module.exports = router;
