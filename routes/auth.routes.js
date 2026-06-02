const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middlewares/upload.middleware');

router.post('/register', upload.none(), authController.register);
router.post('/login', upload.none(), authController.login);
router.post('/logout', authController.logout);

module.exports = router;
