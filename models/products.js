module.exports = (sequelize, Sequelize) => {
  const Products = sequelize.define("product", {
    // id: {
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     primaryKey: true
    // },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
      
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    rating: {
      type: Sequelize.INTEGER,
    },
  },{
    paranoid: true,
    // If you want to give a custom name to the deletedAt column
    deletedAt: 'destroyTime',
  });
  return Products;
};
