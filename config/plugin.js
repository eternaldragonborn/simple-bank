/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  orm: {
    enable: true,
    package: 'egg-orm',
    database: 'simple-bank',
    port: process.env.MYSQL_PORT,
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },

  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },

  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  }
};
