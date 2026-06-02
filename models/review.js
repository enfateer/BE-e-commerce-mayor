// Review & rating telah dihapus.
// File ini sengaja dibiarkan untuk kompatibilitas require, tetapi model tidak akan di-load
// karena models/index.js memfilter review.js.
module.exports = () => {
  throw new Error('Review model disabled');
};

