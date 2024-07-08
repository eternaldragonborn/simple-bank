module.exports = app => {
  const { Bone, DataTypes: { STRING, INTEGER, DATE } } = app.model;

  return class Record extends Bone {
    static table = 'records';

    static attributes = {
      user: STRING,
      amount: INTEGER,
      balance: INTEGER,
      createdAt: DATE,
    };
  }
}