const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Protected Routes
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('profilePicture'), userController.updateProfile);
router.put('/become-seller', userController.becomeSeller);

module.exports = router;
