const https = require("https");
const axios = require("axios");

var express = require("express");
const auth = require("../auth");
const { users, orders, sequelize, ukms, transaction } = require("../models");
const { GetSaldo } = require("../vendor/payment");
var router = express.Router();

/* GET users listing. */
router.get("/", auth, async function (req, res, next) {
  const { id } = await findIDUserFromUsername(req.session.username);
  let [data, datalength] = await GetOrdersFromTransaction(id);
  const saldo = await GetSaldo(req.session.username);
  data = data.map((element) => {
    return {
      ...element,
      total_payment: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(element.total_payment),
    };
  });
  let nominal = null;
  if (saldo != undefined) {
    nominal = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(saldo.nominal);
  }
  res.render("transaction", { session: req.session, data, saldo: nominal });
});

router.get("/pay/:idtransaction", auth, async function (req, res, next) {
  try {
    const { id } = await findIDUserFromUsername(req.session.username);
    const { idtransaction } = req.params;
    const idtransactionInt = parseInt(idtransaction);

    const data = await GetOrdersAndUkm(id, idtransactionInt);

    paytoListUser(data, req.session.username).then((request) => {
      console.log(request);
      axios.all(request);
    });
    await UpdateTransactionPaid(idtransactionInt);
    res.redirect("/transaction");
  } catch (error) {
    res.end({ error });
  }
});

async function findIDUserFromUsername(username) {
  return await users.findOne({
    where: { username: username },
    attributes: ["id"],
  });
}

async function GetOrdersFromTransaction(iduser) {
  return await sequelize.query(
    `SELECT DISTINCT o.transaction_fk,t.total_payment,t.status FROM orders AS o INNER JOIN transactions AS t ON t.id = o.transaction_fk WHERE o.user_fk = ?`,
    {
      replacements: [iduser],
      raw: true,
    }
  );
}

async function paytoListUser(listUkmUser, idUserSeller) {
  let request = [];

  const instance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
  for (let index = 0; index < listUkmUser.length; index++) {
    const postData = {
      userMe: idUserSeller,
      userTarget: listUkmUser[index]["ukm.user.name"],
      nominal:
        listUkmUser[index].total_price + listUkmUser[index].delivery_price,
      date: listUkmUser[index].createdAt,
    };
    request.push(
      await instance.post("https://localhost:3001/api/payment", postData)
    );
  }
  return request;
}

async function GetOrdersAndUkm(id, idtransaction) {
  return await orders.findAll({
    where: { user_fk: id, transaction_fk: idtransaction },
    attributes: ["total_price", "delivery_price", "createdAt"],
    include: [{ model: ukms, include: [{ model: users }] }],
    raw: true,
  });
}

async function UpdateTransactionPaid(id) {
  return await transaction.update(
    { status: "paid" },
    {
      where: { id },
    }
  );
}

module.exports = router;
