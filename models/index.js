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

db.users = require("./user")(sequelize, Sequelize);
db.orders = require("./orders")(sequelize, Sequelize);
db.order_detail = require("./order_detail")(sequelize, Sequelize);
db.ukms = require("./ukm")(sequelize, Sequelize);
db.products = require("./products")(sequelize, Sequelize);
db.reviews = require("./reviews")(sequelize, Sequelize);
db.roles = require("./role")(sequelize, Sequelize);

db.users.hasMany(db.order_detail, { foreignKey: "user_fk" });
db.users.hasOne(db.ukms);
db.users.belongsTo(db.roles);
db.users.hasMany(db.ukms);
db.users.hasMany(db.reviews, { foreignKey: "id_user" });

db.ukms.hasMany(db.orders, { foreignKey: "ukm_fk" });
db.ukms.hasMany(db.products, { foreignKey: "ukm_fk" });
db.ukms.belongsTo(db.users);

db.products.hasMany(db.order_detail, { foreignKey: "products_fk" });
db.products.hasMany(db.reviews, {
  as: "reviews",
});

db.orders.hasMany(db.order_detail, { foreignKey: "orders_fk" });
db.users.hasOne(db.orders, {
  through: db.order_detail,
  foreignKey: "user_fk",
});

db.reviews.belongsTo(db.products, {
  foreignKey: "id_product",
  allowNull: false,
});

module.exports = db;
