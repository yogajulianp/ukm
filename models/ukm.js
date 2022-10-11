module.exports = (sequelize, Sequelize) => {
  const Ukm = sequelize.define("ukm", {
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.TEXT
    },
  });

  return Ukm;
};