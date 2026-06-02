const { response } = require('../helpers/response.formatter');

const sellerMiddleware = (req, res, next) => {
    // Admin tidak boleh menggunakan akses seller
    if (req.user && req.user.role === 'admin') {
        return res.status(403).json(response(403, 'Forbidden - Admin cannot be seller'));
    }

    if (req.user && req.user.isSeller) {
        return next();
    }
    return res.status(403).json(response(403, 'Forbidden - Seller access only'));
};


module.exports = sellerMiddleware;
