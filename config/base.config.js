require('dotenv').config();

module.exports = {
  app: {
    name: process.env.APP_NAME || 'ORVIX',
    port: parseInt(process.env.APP_PORT) || 3000,
    url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 3000}`,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'orvix_db',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'default_secret',
  },
};
