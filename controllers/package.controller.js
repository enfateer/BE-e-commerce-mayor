const Validator = require("fastest-validator");
const v = new Validator({ convert: true });
const { ServicePackage, Service } = require('../models');
const { response } = require('../helpers/response.formatter');

const formatValidationErrors = (errors) =>
    errors.map((e) => `${e.field}: ${e.message}`).join(', ');
const { normalizeTierName, sortPackagesByTier } = require('../helpers/package-tiers');

module.exports = {
    getPackagesByService: async (req, res) => {
        try {
            const packages = await ServicePackage.findAll({
                where: { serviceId: req.params.serviceId },
            });
            const sorted = sortPackagesByTier(packages.map((p) => p.get({ plain: true })));
            return res.status(200).json(response(200, 'Packages retrieved', sorted));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    createPackage: async (req, res) => {
        try {
            const serviceId = req.params.serviceId;
            const service = await Service.findByPk(serviceId);
            if (!service) return res.status(404).json(response(404, 'Service not found'));
            if (service.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            const { name, price, deliveryTime, description } = req.body;

            const data = {
                name: typeof name === 'string' ? name.trim() : name,
                price: Number(price),
                deliveryTime: deliveryTime !== undefined && deliveryTime !== '' ? Number(deliveryTime) : 7,
                description: typeof description === 'string' ? description.trim() : description,
            };

            const schema = {
                name: { type: 'string', min: 3, max: 255 },
                price: { type: 'number', positive: true },
                deliveryTime: { type: 'number', positive: true, integer: true },
                description: { type: 'string', optional: true },
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, formatValidationErrors(validate), validate));
            }

            const tierName = normalizeTierName(data.name);
            if (!tierName) {
                return res.status(400).json(response(400, 'Package harus Basic, Gold, atau Pro'));
            }
            data.name = tierName;

            const duplicate = await ServicePackage.findOne({
                where: { serviceId, name: tierName },
            });
            if (duplicate) {
                return res.status(400).json(response(400, `Package ${tierName} sudah ada untuk service ini`));
            }

            const detailLines = data.description
                ? data.description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
                : [];

            const pkg = await ServicePackage.create({
                serviceId,
                name: data.name,
                price: data.price,
                deliveryTime: data.deliveryTime,
                description: data.description || null,
                features: detailLines.length > 0 ? detailLines : null,
            });

            return res.status(201).json(response(201, 'Package created', pkg.get({ plain: true })));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    updatePackage: async (req, res) => {
        try {
            const pkg = await ServicePackage.findByPk(req.params.id, {
                include: [{ model: Service, as: 'service' }],
            });
            if (!pkg) return res.status(404).json(response(404, 'Package not found'));

            const service = await Service.findByPk(pkg.serviceId);
            if (service.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            const { name, price, deliveryTime, description } = req.body;

            const data = {
                name: name !== undefined ? (typeof name === 'string' ? name.trim() : name) : undefined,
                price: price !== undefined && price !== '' ? Number(price) : undefined,
                deliveryTime: deliveryTime !== undefined && deliveryTime !== '' ? Number(deliveryTime) : undefined,
                description: description !== undefined ? (typeof description === 'string' ? description.trim() : description) : undefined,
            };

            const schema = {
                name: { type: 'string', min: 3, max: 255, optional: true },
                price: { type: 'number', positive: true, optional: true },
                deliveryTime: { type: 'number', positive: true, integer: true, optional: true },
                description: { type: 'string', optional: true },
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, formatValidationErrors(validate), validate));
            }

            if (data.name !== undefined) {
                const tierName = normalizeTierName(data.name);
                if (!tierName) {
                    return res.status(400).json(response(400, 'Package harus Basic, Gold, atau Pro'));
                }
                if (tierName !== normalizeTierName(pkg.name)) {
                    const duplicate = await ServicePackage.findOne({
                        where: { serviceId: pkg.serviceId, name: tierName },
                    });
                    if (duplicate && duplicate.id !== pkg.id) {
                        return res.status(400).json(response(400, `Package ${tierName} sudah ada`));
                    }
                }
                pkg.name = tierName;
            }
            if (data.price !== undefined) pkg.price = data.price;
            if (data.deliveryTime !== undefined) pkg.deliveryTime = data.deliveryTime;
            if (data.description !== undefined) {
                pkg.description = data.description;
                const detailLines = data.description
                    ? data.description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
                    : [];
                pkg.features = detailLines.length > 0 ? detailLines : null;
            }
            await pkg.save();
            return res.status(200).json(response(200, 'Package updated', pkg.get({ plain: true })));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    deletePackage: async (req, res) => {
        try {
            const pkg = await ServicePackage.findByPk(req.params.id);
            if (!pkg) return res.status(404).json(response(404, 'Package not found'));

            const service = await Service.findByPk(pkg.serviceId);
            if (service.userId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json(response(403, 'Unauthorized'));
            }

            await pkg.destroy();
            return res.status(200).json(response(200, 'Package deleted'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },
};
