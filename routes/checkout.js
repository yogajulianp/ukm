var express = require("express");
var router = express.Router();
const { order_detail, orders, products, sequelize } = require("../models");

const auth = require('../auth');

router.get("/", auth, async function (req, res, next) {
  const listOrder = await GetOrderFromSpecificUser(3);
  let TotalPrice = 0;
  listOrder.forEach((element) => {
    TotalPrice += element.total_price;
  });
  TotalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(TotalPrice);
  res.render("cart/checkout/", {
    data: listOrder,
    TotalPrice,
    session: req.session
  });
});

router.get("/delete/:id", async function (req, res, next) {
  const { id } = req.params;
  let data = await DeleteOrderDetail(id);
  res.redirect("/cart");
});

router.get("/update", async function (req, res, next) {
  let { id, quantity, isadd } = req.query;
  if (isadd == 1) {
    quantity++;
  } else {
    quantity--;
  }

  let data = await UpdateQuantityOrderDetail(id, quantity);
  res.redirect("/cart");
});

async function GetOrderFromSpecificUser(idUser) {
  const res = orders.findAll({
    where: { user_fk: idUser, transaction_fk: null },
    raw: true,
  });
  return res;
}

module.exports = router;
