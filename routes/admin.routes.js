const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.get('/sellers', adminController.getAllSellers);
router.get('/reports', adminController.getReports);
router.get('/notifications', adminController.getAllNotifications);
router.post('/users/:id/warn', adminController.warnUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.delete('/services/:id', adminController.deleteService);

module.exports = router;
