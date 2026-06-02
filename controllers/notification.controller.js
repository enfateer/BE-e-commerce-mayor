const { Notification } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {
    getMyNotifications: async (req, res) => {
        try {
            const notifications = await Notification.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(response(200, 'Notifications retrieved', notifications));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const notification = await Notification.findByPk(id);
            
            if (!notification) return res.status(404).json(response(404, 'Notification not found'));
            if (notification.userId !== req.user.id) return res.status(403).json(response(403, 'Unauthorized'));

            notification.isRead = true;
            await notification.save();
            
            return res.status(200).json(response(200, 'Notification marked as read'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            await Notification.update({ isRead: true }, {
                where: { userId: req.user.id }
            });
            return res.status(200).json(response(200, 'All notifications marked as read'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
