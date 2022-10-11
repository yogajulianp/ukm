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
db.users = require("./user")(sequelize, Sequelize);
db.ukms = require("./ukm")(sequelize, Sequelize);

db.orders.hasMany(db.order_detail, { foreignKey: "orders_fk" });
db.order_detail.hasMany(db.orders, { foreignKey: "order_detail_fk" });
db.users.hasMany(db.order_detail, { foreignKey: "user_customer_fk" });
db.ukms.hasMany(db.order_detail, { foreignKey: "ukm_fk" });
db.users.hasMany(db.ukms);
db.ukms.belongsTo(db.users);

module.exports = db;
