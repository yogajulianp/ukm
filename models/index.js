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
db.transaction = require("./transaction")(sequelize, Sequelize);
db.category = require("./categories")(sequelize, Sequelize);

db.users.hasMany(db.order_detail, { foreignKey: "user_fk" });
db.users.hasOne(db.ukms);
db.ukms.hasOne(db.users);
db.users.belongsTo(db.roles);
db.users.hasMany(db.reviews, { foreignKey: "id_user" });

db.ukms.hasMany(db.orders, { foreignKey: "ukm_fk" });
db.ukms.hasMany(db.products, { foreignKey: "ukm_fk" });

db.order_detail.belongsTo(db.products, { foreignKey: "products_fk" });

db.products.hasMany(db.order_detail, { foreignKey: "products_fk" });
db.products.hasMany(db.reviews, {
  as: "reviews",
});

db.category.hasMany(db.products, { foreignKey: "category_fk" });

db.orders.hasMany(db.order_detail, { foreignKey: "orders_fk" });
db.orders.belongsTo(db.ukms, { foreignKey: "ukm_fk" });
db.orders.belongsTo(db.transaction, { foreignKey: "transaction_fk" });

db.users.hasMany(db.orders, {
  foreignKey: "user_fk",
});

db.reviews.belongsTo(db.products, {
  foreignKey: "id_product",
  allowNull: false,
});

db.products.belongsTo(db.category, {
  foreignKey: "category_fk",
  allowNull: false,
});

db.transaction.hasMany(db.orders, { foreignKey: "transaction_fk" });

module.exports = db;
