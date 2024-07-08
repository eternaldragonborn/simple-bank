/**
 *
 * @param {Egg.Application} app
 */
module.exports = app => {
  const { Bone, DataTypes: { STRING, INTEGER } } = app.model;

  return class User extends Bone {
    static table = 'users';

    static primaryKey = 'username';

    static attributes = {
      username: {
        type: STRING,
        primaryKey: true,
        columnName: 'username',
      },
      password: STRING,
      balance: INTEGER,
    }
  };
}