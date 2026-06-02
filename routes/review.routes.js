const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/service/:serviceId', reviewController.getServiceReviews);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
