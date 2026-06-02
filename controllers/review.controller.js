const { response } = require('../helpers/response.formatter');

module.exports = {
  getServiceReviews: async (req, res) => {
    return res.status(200).json(response(200, 'Reviews retrieved', []));
  },

  createReview: async (req, res) => {
    return res.status(503).json(response(503, 'Review feature is currently disabled'));
  },
};
