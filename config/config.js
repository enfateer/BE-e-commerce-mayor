const baseConfig = require('./base.config');

module.exports = {
  development: {
    username: baseConfig.db.user,
    password: baseConfig.db.pass,
    database: baseConfig.db.name,
    host: baseConfig.db.host,
    port: baseConfig.db.port,
    dialect: 'mysql',
  },
  test: {
    username: baseConfig.db.user,
    password: baseConfig.db.pass,
    database: `${baseConfig.db.name}_test`,
    host: baseConfig.db.host,
    port: baseConfig.db.port,
    dialect: 'mysql',
  },
  production: {
    username: baseConfig.db.user,
    password: baseConfig.db.pass,
    database: baseConfig.db.name,
    host: baseConfig.db.host,
    port: baseConfig.db.port,
    dialect: 'mysql',
  },
};
