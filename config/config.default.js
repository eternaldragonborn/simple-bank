/* eslint valid-jsdoc: "off" */
require('dotenv').config();

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1719805583337_7725';

  // add your middleware config here
  config.middleware = [];

  config.orm = {
    client: 'mysql2',
    database: 'simple_bank',
    host: 'localhost',
    password: 'sqlpassword',
    user: 'root',
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.logger = {
    consoleLevel: "DEBUG",
  };

  config.view = {
    mapping: {
      '.nj': 'nunjucks',
      '.ejs': 'ejs',
    },
    defaultViewEngine: 'nunjucks',
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
