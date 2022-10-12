module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    status: {
      type: Sequelize.STRING,
    },
    total_payment: {
      type: Sequelize.FLOAT,
    },
  });

  return Transaction;
};
