const Validator = require("fastest-validator");
const v = new Validator();
const { User, Service, Category, ServicePackage, Sequelize } = require('../models');
const { response } = require('../helpers/response.formatter');
const { sortPackagesByTier } = require('../helpers/package-tiers');

module.exports = {
    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });
            return res.status(200).json(response(200, 'Profile retrieved', user));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { name, whatsappNumber, bio } = req.body;

            const schema = {
                name: { type: 'string', min: 3, max: 255, optional: true },
                bio: { type: 'string', optional: true },
            };

            const data = { name, bio };
            if (whatsappNumber !== undefined && String(whatsappNumber).trim() !== '') {
                data.whatsappNumber = String(whatsappNumber).trim();
                schema.whatsappNumber = { type: 'string', min: 10, max: 20 };
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            const user = await User.findByPk(req.user.id);

            if (name !== undefined && name !== '') {
                user.name = typeof name === 'string' ? name.trim() : name;
            }
            if (bio !== undefined) {
                user.bio = bio;
            }

            if (whatsappNumber !== undefined) {
                if (!user.isSeller) {
                    return res.status(403).json(response(403, 'Hanya seller yang dapat mengatur nomor WhatsApp'));
                }
                const wa = typeof whatsappNumber === 'string' ? whatsappNumber.trim() : '';
                if (wa && !/^\d{10,15}$/.test(wa.replace(/\D/g, ''))) {
                    return res.status(400).json(response(400, 'Nomor WhatsApp tidak valid (10–15 digit)'));
                }
                user.whatsappNumber = wa || null;
            }
            
            if (req.file) {
                // buat URL publik sesuai static middleware di app.js
                user.profilePicture = `api/uploads/profile/${req.file.filename}`;

            }


            await user.save();
            const plain = user.get({ plain: true });
            delete plain.password;
            return res.status(200).json(response(200, 'Profile updated', plain));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    becomeSeller: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            if (user.role === 'admin') {
                return res.status(403).json(response(403, 'Admin tidak dapat menjadi seller'));
            }
            if (user.isSeller) {
                return res.status(400).json(response(400, 'You are already a seller'));
            }

            user.isSeller = true;
            await user.save();
            return res.status(200).json(response(200, 'You are now a seller'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getSellerDetail: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findByPk(userId, {
                attributes: ['id', 'name', 'profilePicture', 'bio', 'isSeller', 'whatsappNumber'],
                include: [
                    {
                        model: Service,
                        as: 'services',
                        attributes: {
                            include: [
                                [
                                    Sequelize.literal(`(
                                        SELECT MIN(price)
                                        FROM service_packages AS package
                                        WHERE package.serviceId = services.id
                                    )`),
                                    'minPrice',
                                ],
                            ],
                        },
                        include: [
                            { model: Category, as: 'category' },
                            { model: ServicePackage, as: 'packages' },
                        ],
                        order: [['createdAt', 'DESC']],
                    },
                ],
            });

            if (!user) {
                return res.status(404).json(response(404, 'Seller not found'));
            }

            if (!user.isSeller) {
                return res.status(400).json(response(400, 'User is not a seller'));
            }

            const userData = user.toJSON();
            userData.averageRating = 0;
            userData.rating = 0;
            userData.totalReviews = 0;
            userData.services = (userData.services || []).map((service) => {
                if (Array.isArray(service.packages)) {
                    service.packages = sortPackagesByTier(service.packages);
                }
                service.user = { id: userData.id, name: userData.name };
                return service;
            });

            return res.status(200).json(response(200, 'Seller detail retrieved', userData));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
