const Validator = require("fastest-validator");
const v = new Validator();
const { Order, Service, ServicePackage, User, sequelize } = require('../models');
const { response } = require('../helpers/response.formatter');
const { buildOrderListWhere } = require('../helpers/order-query.helpers');

module.exports = {
    createOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { serviceId, packageId, requirements } = req.body;
            
            const schema = {
                serviceId: { type: "number", positive: true, integer: true },
                packageId: { type: "number", positive: true, integer: true },
                requirements: { type: "string", optional: true }
            }

            const data = {
                serviceId: Number(serviceId),
                packageId: Number(packageId),
                requirements
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                await t.rollback();
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            const service = await Service.findByPk(data.serviceId);
            if (!service) {
                await t.rollback();
                return res.status(404).json(response(404, 'Service not found'));
            }
            
            const pkg = await ServicePackage.findOne({ where: { id: data.packageId, serviceId: data.serviceId } });
            if (!pkg) {
                await t.rollback();
                return res.status(404).json(response(404, 'Package not found for this service'));
            }

            // Admin tidak boleh membuat order
            if (req.user.role === 'admin') {
                await t.rollback();
                return res.status(403).json(response(403, 'Forbidden - Admin cannot create orders'));
            }

            if (service.userId === req.user.id) {
                await t.rollback();
                return res.status(400).json(response(400, 'You cannot order your own service'));
            }





            const order = await Order.create({
                buyerId: req.user.id,
                sellerId: service.userId,
                serviceId: data.serviceId,
                packageId: data.packageId,
                requirements: data.requirements,
                status: 'pending'
            }, { transaction: t });

            await t.commit();
            return res.status(201).json(response(201, 'Order created successfully', order));
        } catch (err) {
            await t.rollback();
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({
                where: buildOrderListWhere(req.user),
                order: [['id', 'DESC']],
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'name'] },
                    { model: User, as: 'seller', attributes: ['id', 'name'] },
                    { model: Service, as: 'service' },
                    { model: ServicePackage, as: 'package' }
                ]
            });
            return res.status(200).json(response(200, 'Orders retrieved', orders));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;

            const schema = {
                status: {
                    type: 'enum',
                    values: [
                        'pending',
                        'accepted',
                        'rejected',
                        'in_progress',
                        'delivered',
                        'completed',
                        'cancelled',
                    ],
                },
            };

            const validate = v.validate({ status }, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            const order = await Order.findByPk(req.params.id);
            if (!order) return res.status(404).json(response(404, 'Order not found'));

            const isSeller = order.sellerId === req.user.id;
            const isBuyer = order.buyerId === req.user.id;
            const isAdmin = req.user.role === 'admin';

            if (!isSeller && !isBuyer && !isAdmin) {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            const transitions = {
                cancelled: { from: ['pending'], by: 'buyer' },
                accepted: { from: ['pending'], by: 'seller' },
                rejected: { from: ['pending'], by: 'seller' },
                in_progress: { from: ['accepted'], by: 'seller' },
                delivered: { from: ['in_progress'], by: 'seller' },
                completed: { from: ['delivered'], by: 'buyer' },
            };

            const rule = transitions[status];
            if (!rule) {
                return res.status(400).json(response(400, 'Invalid status'));
            }

            const roleAllowed =
                isAdmin ||
                (rule.by === 'seller' && isSeller) ||
                (rule.by === 'buyer' && isBuyer);

            if (!roleAllowed) {
                return res.status(403).json(response(403, `Only ${rule.by} can set status to ${status}`));
            }

            if (!rule.from.includes(order.status)) {
                return res.status(400).json(
                    response(400, `Cannot change status from "${order.status}" to "${status}"`)
                );
            }

            order.status = status;
            await order.save();
            return res.status(200).json(response(200, `Order ${status}`, order));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getSellerDashboard: async (req, res) => {
        try {
            const sellerId = req.user.id;

            const totalOrders = await Order.count({ where: { sellerId } });
            const pendingOrders = await Order.count({ where: { sellerId, status: 'pending' } });
            const completedOrders = await Order.count({ where: { sellerId, status: 'completed' } });
            const cancelledOrders = await Order.count({ where: { sellerId, status: 'cancelled' } });

            // Calculate revenue (sum of prices of completed orders)
            const completedOrdersData = await Order.findAll({
                where: { sellerId, status: 'completed' },
                include: [{ model: ServicePackage, as: 'package', attributes: ['price'] }]
            });

            const revenue = completedOrdersData.reduce((sum, order) => {
                return sum + parseFloat(order.package.price);
            }, 0);

            return res.status(200).json(response(200, 'Seller dashboard data retrieved', {
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                revenue
            }));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getOrderDetail: async (req, res) => {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
                    { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
                    { model: Service, as: 'service' },
                    { model: ServicePackage, as: 'package' }
                ]
            });

            if (!order) return res.status(404).json(response(404, 'Order not found'));

            // Check authorization
            if (req.user.role !== 'admin' && order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            return res.status(200).json(
                response(200, 'Order retrieved', order.get({ plain: true }))
            );
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
