/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  orm: {
    enable: true,
    package: 'egg-orm',
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
  },
};
