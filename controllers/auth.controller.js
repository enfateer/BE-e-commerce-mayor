const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { User } = require('../models');
const { fn, col, where } = require('sequelize');
const passwordHash = require('password-hash');
const { generateToken } = require('../helpers/jwt');

module.exports = {
    register: async (req, res) => {
        try {
            // schema validasi data
            const schema = {
                name: { type: "string", min: 3, max: 255 },
                email: { type: "email" },
                password: { type: "string", min: 6 },
            }

            // menyiapkan sumber data
            const data = {
                name: (req.body.name || '').trim(),
                email: (req.body.email || '').trim().toLowerCase(),
                password: req.body.password
            }

            // cek validasi
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            const existingUser = await User.findOne({ where: { email: data.email } });
            if (existingUser) {
                return res.status(400).json(response(400, 'Email already registered'));
            }

            const hashedPassword = passwordHash.generate(data.password);
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: 'buyer',
                isSeller: false
            });

            return res.status(201).json(response(201, 'Registration successful', { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            }));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    login: async (req, res) => {
        try {
            const schema = {
                email: { type: "email" },
                password: { type: "string" },
            }

            const data = {
                email: (req.body.email || '').trim().toLowerCase(),
                password: req.body.password
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'error validasi', validate));
            }

            const user = await User.findOne({
                where: where(fn('LOWER', col('email')), data.email),
            });
            if (!user || !passwordHash.verify(data.password, user.password)) {
                return res.status(401).json(response(401, 'Invalid credentials'));
            }

            if (user.isBanned) {
                return res.status(403).json(response(403, 'Your account is banned'));
            }

            const token = generateToken({ id: user.id, role: user.role });
            return res.status(200).json(response(200, 'Login successful', {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isSeller: user.isSeller
                }
            }));
        } catch (err) {
            return res.status(500).json(response(500, 'server error', err.message));
        }
    },

    logout: (req, res) => {
        return res.status(200).json(response(200, 'Logout successful'));
    }
}
