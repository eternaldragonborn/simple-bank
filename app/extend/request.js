module.exports = {
  /**
   * @this {import('egg').Request}
   */
  get userToken() {
    const authHeader = this.header.authorization;
    if (authHeader) {
      const bearer = authHeader.split(' ');
      // console.log(bearer);
      return bearer[1];
    }
  },
}