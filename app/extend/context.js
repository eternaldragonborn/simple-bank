const jwt = require('jsonwebtoken');
const TOKEN = Symbol('Context#token');
const USERNAME = Symbol('Context#username');

module.exports = {
  throwError(code = 400, msg = '伺服器錯誤', data) {
    this.status = code;
    this.body = { msg }

    this.app.logger.warn(`${code}: ${msg}` + (data ? ` - ${JSON.stringify(data, '', 2)}` : ''));
  },
  get userToken() {
    if (!this[TOKEN]) {
      const authHeader = this.request.header.authorization;
      if (authHeader) {
        const bearer = authHeader.split(' ')[1];
        // this.logger.debug(bearer)
        return bearer;
      }
    }

    return this[TOKEN];
  },
  get userName() {
    if (!this[USERNAME]) {
      try {
        const user = jwt.verify(this.userToken, process.env.JWT_SECRET);
        return user.user;
      } catch (err) {
        this.logger.warn(`JWT validation failed - ${this.userToken}: ${err}`);
      }
    }

    return this[USERNAME];
  }
}