var express = require("express");
const auth = require("../auth");
var router = express.Router();
const {
  order_detail,
  orders,
  products,
  sequelize,
  ukms,
  transaction,
} = require("../models");

router.get("/", auth, async function (req, res, next) {
  let listOrder = await GetOrderFromSpecificUser(3);
  let TotalPriceRaw = 0;
  let allIdOrder = [];
  listOrder = listOrder.map((element) => {
    TotalPriceRaw += element.total_price;
    allIdOrder.push(element.id);
    return {
      ...element,
      total_price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(element.total_price),
    };
  });
  let allOrderDetailProduct = await GetOrderDetailsFromSpecificOrders(
    allIdOrder
  );

  allOrderDetailProduct = allOrderDetailProduct.map((element) => {
    let tempPrice = element["product.price"] * element.quantity;
    return {
      ...element,
      "product.price": new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(element["product.price"]),

      "product.price_total": new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(tempPrice),
    };
  });
  let TotalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(TotalPriceRaw);
  res.render("cart/checkout/", {
    data: listOrder,
    TotalPrice,
    TotalPriceRaw,
    orderDetail: allOrderDetailProduct,
    session: req.session,
  });
});

router.get("/delete/:id", async function (req, res, next) {
  const { id } = req.params;
  let data = await DeleteOrderDetail(id);
  res.redirect("/cart");
});

router.post("/pay", async function (req, res, next) {
  try {
    const { payment } = req.body;
    let paymentInt = parseInt(payment);
    listOrder = await GetOrderFromSpecificUser(3);
    let listOrderId = [];
    listOrder.forEach((element) => {
      listOrderId.push(element.id);
    });
    const { id } = await SetTransaction(paymentInt);
    await UpdateOrderFromTransaction(id, listOrderId);
    res.redirect("/");
  } catch (error) {
    res.send({ message: "ERROR TRANSACTION " + error });
  }
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
    include: [{ model: ukms }],
    raw: true,
  });
  return res;
}

async function GetOrderDetailsFromSpecificOrders(idOrders) {
  const res = order_detail.findAll({
    where: { orders_fk: idOrders },
    include: [{ model: products }],
    raw: true,
  });
  return res;
}

async function SetTransaction(totalPayment) {
  const res = transaction.create(
    { total_payment: totalPayment, status: "not paid" },
    {
      raw: true,
    }
  );
  return res;
}

async function UpdateOrderFromTransaction(transactionid, listOrder) {
  orders.update(
    { transaction_fk: transactionid },
    {
      where: { id: listOrder },
      raw: true,
    }
  );
}

module.exports = router;
