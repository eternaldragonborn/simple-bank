/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const loginMiddleware = middleware.login();

  router.get('/account/balance', loginMiddleware, controller.account.getBalance);
  router.post('/account/create', controller.account.create);
  router.post('/account/login', controller.account.login);
  router.get('/account/recipes', loginMiddleware, controller.account.recipes);

  router.post('/user/deposit', loginMiddleware, controller.user.deposit);
  router.post('/user/withdraw', loginMiddleware, controller.user.withdraw);
};
