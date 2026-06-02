const Validator = require("fastest-validator");
const v = new Validator({ convert: true });

const formatValidationErrors = (errors) =>
    errors.map((e) => `${e.field}: ${e.message}`).join(', ');
const { Service, User, Category, ServicePackage, Sequelize } = require('../models');
const { response } = require('../helpers/response.formatter');
const { sortPackagesByTier } = require('../helpers/package-tiers');
const { Op } = Sequelize;

const withSortedPackages = (service) => {
    const plain = service.get ? service.get({ plain: true }) : service;
    if (Array.isArray(plain.packages)) {
        plain.packages = sortPackagesByTier(plain.packages);
    }
    return plain;
};

module.exports = {
    getAllServices: async (req, res) => {
        try {
            const { categoryId, search, sort } = req.query;
            let where = {};

            if (categoryId) {
                where.categoryId = Number(categoryId);
            }

            if (search) {
                where.title = { [Op.like]: `%${search}%` };
            }

            let attributes = {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT MIN(price)
                            FROM service_packages AS package
                            WHERE package.serviceId = Service.id
                        )`),
                        'minPrice'
                    ]
                ]
            };

            let order = [['createdAt', 'DESC']];
            if (sort === 'oldest') order = [['createdAt', 'ASC']];
            if (sort === 'cheapest') order = [[Sequelize.literal('minPrice'), 'ASC']];
            if (sort === 'expensive') order = [[Sequelize.literal('minPrice'), 'DESC']];

            const services = await Service.findAll({
                where,
                attributes,
                order,
                include: [
                    { model: User, as: 'user', attributes: ['id', 'name'] },
                    { model: Category, as: 'category' },
                    { model: ServicePackage, as: 'packages' }
                ]
            });
            const payload = services.map(withSortedPackages);
            return res.status(200).json(response(200, 'Services retrieved', payload));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    getServiceDetail: async (req, res) => {
        try {
            const service = await Service.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'user', attributes: ['id', 'name', 'whatsappNumber'] },
                    { model: Category, as: 'category' },
                    { model: ServicePackage, as: 'packages' }
                ]
            });
            if (!service) return res.status(404).json(response(404, 'Service not found'));

            return res.status(200).json(
                response(200, 'Service detail retrieved', withSortedPackages(service))
            );
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    createService: async (req, res) => {
        try {
            const { categoryId, title, description } = req.body;

            const data = {
                categoryId: categoryId !== undefined && categoryId !== '' ? Number(categoryId) : null,
                title: typeof title === 'string' ? title.trim() : title,
                description: typeof description === 'string' ? description.trim() : description,
            };

            const schema = {
                categoryId: { type: "number", positive: true, integer: true },
                title: { type: "string", min: 5, max: 255 },
                description: { type: "string", min: 10 },
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, formatValidationErrors(validate), validate));
            }

            const thumbnail = req.file
                ? req.file.path
                    .replace(/\\/g, '/')
                    .replace(/^.*uploads\//i, '')
                : null;

            // Kembalikan thumbnail sebagai URL full agar langsung bisa diakses oleh frontend/Postman
            const thumbnailUrl = thumbnail
                ? `/api/uploads/${thumbnail}`
                : null;


            const service = await Service.create({
                userId: req.user.id,
                categoryId: data.categoryId,
                title: data.title,
                description: data.description,
                thumbnail: thumbnailUrl
            });


            return res.status(201).json(response(201, 'Service created', service.get({ plain: true })));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    updateService: async (req, res) => {
        try {
            const service = await Service.findByPk(req.params.id);
            if (!service) return res.status(404).json(response(404, 'Service not found'));
            if (service.userId !== req.user.id) return res.status(403).json(response(403, 'Unauthorized'));

            const { categoryId, title, description } = req.body;

            const data = {
                categoryId: categoryId !== undefined && categoryId !== '' ? Number(categoryId) : undefined,
                title: typeof title === 'string' ? title.trim() : title,
                description: typeof description === 'string' ? description.trim() : description,
            };

            const schema = {
                categoryId: { type: "number", positive: true, integer: true, optional: true },
                title: { type: "string", min: 5, max: 255, optional: true },
                description: { type: "string", min: 10, optional: true },
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, formatValidationErrors(validate), validate));
            }

            if (req.file) {
                const newThumb = req.file.path
                    .replace(/\\/g, '/')
                    .replace(/^.*uploads\//i, '');
                service.thumbnail = `/api/uploads/${newThumb}`;
            }
            

            
            service.categoryId = data.categoryId || service.categoryId;
            service.title = data.title || service.title;
            service.description = data.description || service.description;

            await service.save();
            return res.status(200).json(response(200, 'Service updated', service.get({ plain: true })));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    deleteService: async (req, res) => {
        try {
            const service = await Service.findByPk(req.params.id);
            if (!service) return res.status(404).json(response(404, 'Service not found'));
            
            if (req.user.role !== 'admin' && service.userId !== req.user.id) {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            await service.destroy();
            return res.status(200).json(response(200, 'Service deleted'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
