const Validator = require("fastest-validator");
const v = new Validator();
const { User, Service, Order, Notification } = require('../models');
const { Op } = require('sequelize');
const { response } = require('../helpers/response.formatter');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({ attributes: { exclude: ['password'] } });
            return res.status(200).json(response(200, 'Users retrieved', users));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getAllSellers: async (req, res) => {
        try {
            const sellers = await User.findAll({ 
                where: { isSeller: true },
                attributes: { exclude: ['password'] }
            });
            return res.status(200).json(response(200, 'Sellers retrieved', sellers));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    warnUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json(response(404, 'User not found'));

            // Admin tidak bisa menerima warning
            if (user.role === 'admin') {
                return res.status(403).json(response(403, 'Forbidden - Admin cannot be warned'));
            }

            user.warningCount += 1;
            let message = `Anda mendapatkan peringatan (${user.warningCount}/3). Harap patuhi aturan platform.`;
            
            if (user.warningCount >= 3) {
                user.isBanned = true;
                message = "Akun Anda telah DIBANNED karena telah menerima 3 peringatan.";
            }
            
            await user.save();

            // Buat Notifikasi
            await Notification.create({
                userId: user.id,
                message: message
            });
            
            return res.status(200).json(response(200, `Warning sent. Count: ${user.warningCount}${user.isBanned ? ' - User BANNED' : ''}`));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    banUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json(response(404, 'User not found'));

            user.isBanned = true;
            await user.save();

            await Notification.create({
                userId: user.id,
                message: "Akun Anda telah di-BANNED oleh admin."
            });

            return res.status(200).json(response(200, 'User banned'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    unbanUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json(response(404, 'User not found'));

            user.isBanned = false;
            user.warningCount = 0;
            await user.save();

            await Notification.create({
                userId: user.id,
                message: "Akun Anda telah di-UNBAN oleh admin. Silakan gunakan platform dengan bijak."
            });

            return res.status(200).json(response(200, 'User unbanned'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getReports: async (req, res) => {
        try {
            const totalUsers = await User.count();
            const totalSellers = await User.count({ where: { isSeller: true } });
            const totalBuyers = await User.count({ where: { isSeller: false, role: 'buyer' } });
            const totalServices = await Service.count();
            const totalOrders = await Order.count();
            const pendingOrders = await Order.count({ where: { status: 'pending' } });
            const inProgressOrders = await Order.count({ where: { status: 'in_progress' } });
            const completedOrders = await Order.count({ where: { status: 'completed' } });
            const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });
            const bannedUsers = await User.count({ where: { isBanned: true } });
            const warnedUsers = await User.count({ where: { warningCount: { [Op.gt]: 0 } } });

            return res.status(200).json(response(200, 'Platform reports retrieved', {
                totalUsers,
                totalSellers,
                totalBuyers,
                totalServices,
                totalOrders,
                pendingOrders,
                inProgressOrders,
                completedOrders,
                cancelledOrders,
                bannedUsers,
                warnedUsers,
            }));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getAllNotifications: async (req, res) => {
        try {
            const notifications = await Notification.findAll({
                order: [['createdAt', 'DESC']],
                limit: 100,
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            });
            return res.status(200).json(response(200, 'Notifications retrieved', notifications));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    deleteService: async (req, res) => {
        try {
            const service = await Service.findByPk(req.params.id);
            if (!service) return res.status(404).json(response(404, 'Service not found'));

            await service.destroy();
            return res.status(200).json(response(200, 'Service deleted by admin'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
