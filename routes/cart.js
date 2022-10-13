var express = require("express");
var router = express.Router();
const { order_detail, orders, products, sequelize } = require("../models");

router.get("/", async function (req, res, next) {
  await DeleteOrderOnSpecificUser(3);
  let data = await getAllOrderDetailSpesificUser(3);
  res.render("cart/cart", { data });
});

router.get("/add", async function (req, res, next) {
  const { productId } = req.query;
  const data = SetOrderDetailFromSpecificUser(3, productId);

  res.redirect("back");
});

router.post("/", async function (req, res, next) {
  let data = await getAllDataForOrders(3);
  var result = data.map((person) => ({
    user_fk: person.user_fk,
    ukm_fk: person["product.ukm_fk"],
    total_price: person.total_price,
    delivery_price: 3000,
  }));
  await DeleteOrderOnSpecificUser(3);

  const res2 = await SetOrderFromListOrderDetail(result);

  const element = res2.map((element) => ({
    order_id: element.id,
    ukm_id: element.ukm_fk,
  }));

  await setAllOrderDetailOnSpesificOrder(3, element);

  res.redirect("/checkout");
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

async function getAllOrderDetailSpesificUser(id) {
  let result = await order_detail.findAll({
    where: { user_fk: id, orders_fk: null },
    include: [{ model: products }],
    raw: true,
  });
  return result;
}

async function DeleteOrderDetail(id) {
  let result = await order_detail.destroy({
    where: { id },
  });
  return result;
}

async function UpdateQuantityOrderDetail(id, quantity) {
  let result = await order_detail.update(
    { quantity },
    {
      where: { id },
    }
  );
  return result;
}

async function getAllDataForOrders(user_id) {
  let order_details = await order_detail.findAll({
    attributes: [
      "user_fk",
      [
        sequelize.literal("SUM(product.price * order_detail.quantity)"),
        "total_price",
      ],
    ],
    where: { user_fk: user_id, orders_fk: null },
    include: [{ model: products, attributes: ["ukm_fk"] }],
    group: ["product.ukm_fk", "user_fk"],
    raw: true,
  });

  return order_details;
}

async function SetOrderFromListOrderDetail(list_order_detail) {
  let order_details = await orders.bulkCreate(list_order_detail, { raw: true });

  return order_details;
}

async function setAllOrderDetailOnSpesificOrder(user_fk, data) {
  let caseQuery = configCaseQuery(data);
  try {
    const [results, metadata] = await sequelize.query(
      `UPDATE order_details SET orders_fk = CASE ${caseQuery} FROM order_details  INNER JOIN products AS p ON products_fk = p.id
    WHERE user_fk = 3 AND orders_fk IS NULL AND delete_at IS NULL;`,
      { replacements: [user_fk] }
    );
  } catch (error) {
    console.log("ERR", error);
  }
}

function configCaseQuery(data) {
  let tempString = "";

  data.forEach((element) => {
    tempString += ` WHEN p.ukm_fk=${element.ukm_id} THEN ${element.order_id}`;
  });

  tempString += " END";
  return tempString;
}

async function SetOrderDetailFromSpecificUser(userId, idProduct) {
  const res = await order_detail.findOne({
    where: { user_fk: userId, products_fk: idProduct, orders_fk: null },
  });

  if (res == null) {
    await order_detail.create({
      user_fk: userId,
      products_fk: idProduct,
      quantity: 1,
    });
    return;
  }
  await order_detail.update(
    {
      quantity: res.quantity + 1,
    },
    { where: { user_fk: userId, products_fk: idProduct, orders_fk: null } }
  );
}

async function DeleteOrderOnSpecificUser(idUser) {
  const res = orders.destroy({
    where: { user_fk: idUser, transaction_fk: null },
  });
  return res;
}

module.exports = router;
