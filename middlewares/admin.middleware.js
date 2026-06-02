const { response } = require('../helpers/response.formatter');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json(response(403, 'Forbidden - Admin access only'));
};

module.exports = adminMiddleware;
