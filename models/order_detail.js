const { DataTypes, Sequelize } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const order = sequelize.define("order_detail", {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    deleteAt: {
      type: "DATETIMEOFFSET",
      allowNull: true,
    },
  });

  return order;
};
