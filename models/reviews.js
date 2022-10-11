module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define("review", {
    id_user : {
      type: Sequelize.INTEGER,
      //allowNull: false
    },
    id_product : {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: false
    },

  });
  return Comment;
};
