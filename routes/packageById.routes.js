const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const sellerMiddleware = require('../middlewares/seller.middleware');
const upload = require('../middlewares/upload.middleware');

router.put('/:id', authMiddleware, sellerMiddleware, upload.none(), packageController.updatePackage);
router.delete('/:id', authMiddleware, sellerMiddleware, packageController.deletePackage);

module.exports = router;
