const { error } = require('../helpers/response');

const bannedMiddleware = (req, res, next) => {
    if (req.user && req.user.isBanned) {
        return error(res, 'Your account is banned', 403);
    }
    next();
};

module.exports = bannedMiddleware;
