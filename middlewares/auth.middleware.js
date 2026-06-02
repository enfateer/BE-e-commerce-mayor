const { verifyToken } = require('../helpers/jwt');
const { response } = require('../helpers/response.formatter');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json(response(401, 'Unauthorized - No token provided'));
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = verifyToken(token);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json(response(401, 'Unauthorized - User not found'));
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json(response(401, 'Unauthorized - Invalid or expired token'));
    }
};

module.exports = authMiddleware;
