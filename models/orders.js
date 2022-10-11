const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const order = sequelize.define("order", {
    deleteAt: {
      type: "DATETIMEOFFSET",
      allowNull: true,
    },
  });

  return order;
};
