const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const order = sequelize.define("order", {
    delivery_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    delete_at: {
      type: "DATETIMEOFFSET",
      allowNull: true,
    },
  });

  return order;
};
