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
  users,
} = require("../models");

router.get("/", auth, async function (req, res, next) {
  const { id } = await findIDUserFromUsername(req.session.username);
  let listOrder = await GetOrderFromSpecificUser(id);
  let TotalPriceRaw = 0;
  let allIdOrder = [];
  let total_delivery_price = 0;
  listOrder = listOrder.map((element) => {
    TotalPriceRaw += element.total_price;
    total_delivery_price += element.delivery_price;
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
  }).format(TotalPriceRaw + total_delivery_price);
  let TotalCartPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(TotalPriceRaw);
  res.render("cart/checkout/", {
    data: listOrder,
    TotalPrice,
    TotalPriceRaw,
    TotalCartPrice,
    total_delivery_price,
    orderDetail: allOrderDetailProduct,
    session: req.session,
  });
});

router.post("/pay", auth, async function (req, res, next) {
  try {
    const userId = await findIDUserFromUsername(req.session.username);
    const { payment } = req.body;
    let paymentInt = parseInt(payment);
    listOrder = await GetOrderFromSpecificUser(userId.id);
    let listOrderId = [];
    listOrder.forEach((element) => {
      listOrderId.push(element.id);
    });
    const { id } = await SetTransaction(paymentInt);
    await UpdateOrderFromTransaction(id, listOrderId);
    await DecreasingProductQuantityFromOrder(listOrderId);
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

function configCaseQueryProducts(data) {
  let tempString = "";

  data.forEach((element) => {
    tempString += ` WHEN p.orders_fk=${element} THEN (pro.quantity - p.quantity)`;
  });

  tempString += " END";
  return tempString;
}
async function DecreasingProductQuantityFromOrder(listOrderId) {
  let caseQuery = configCaseQueryProducts(listOrderId);
  await sequelize.query(
    `UPDATE products SET quantity = CASE ${caseQuery} FROM products AS pro RIGHT JOIN order_details AS p ON p.products_fk = pro.id WHERE p.orders_fk IN (?) AND p.delete_at IS NULL;`,
    { replacements: [listOrderId] }
  );
}

async function findIDUserFromUsername(username) {
  return await users.findOne({
    where: { username: username },
    attributes: ["id"],
  });
}

module.exports = router;
