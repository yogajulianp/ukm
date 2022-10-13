module.exports = (sequelize, Sequelize) => {
    const Categories = sequelize.define("categories", {
      category: {
        type: Sequelize.STRING,
        allowNull: false
      }
    },{
      paranoid: true,
      // If you want to give a custom name to the deletedAt column
      deletedAt: 'destroyTime',
    });
    return Categories;
  };
  