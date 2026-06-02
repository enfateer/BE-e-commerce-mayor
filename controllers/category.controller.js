const Validator = require("fastest-validator");
const v = new Validator();
const { Category } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.findAll();
            return res.status(200).json(response(200, 'Categories retrieved', categories));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            
            const schema = {
                name: { type: "string", min: 3, max: 255 }
            }

            const validate = v.validate({ name }, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }
            
            const category = await Category.create({ name });
            return res.status(201).json(response(201, 'Category created', category));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) return res.status(404).json(response(404, 'Category not found'));
            
            await category.destroy();
            return res.status(200).json(response(200, 'Category deleted'));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    }
}
