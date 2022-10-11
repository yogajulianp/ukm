const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD } = process.env;

let sequelize = new Sequelize("UKMdb", null, null, {
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  dialect: "mssql",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user')(sequelize, Sequelize);
db.ukms = require('./ukm')(sequelize, Sequelize);
db.products = require("./products")(sequelize, Sequelize);
db.reviews = require("./reviews")(sequelize, Sequelize);

db.users.hasMany(db.ukms);
db.ukms.belongsTo(db.users);

db.products.hasMany(db.reviews, { 
  as: "reviews" 
});

db.reviews.belongsTo(db.products, { 
  foreignKey: "id_product", 
  allowNull: false 
});



module.exports = db;
