module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    lat: {
      type: Sequelize.DOUBLE
    },
    lon: {
      type: Sequelize.DOUBLE
    },
    role: {
      type: Sequelize.STRING
    }
  });

  return User;
};