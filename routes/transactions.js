var express = require("express");
var router = express.Router();

const auth = require("../auth");
const db = require("../models/index");
const Transaction = db.transaction;
const Order = db.orders;

router.get("/", auth, async (req, res, next) => {
  await Transaction.findAll({
    include: [
      {
        model: Order,
        where: { user_fk: 3 },
        required: true,
      },
    ],
  })
    .then((data) => {
      res.render('transactions', { data, session: req.session })
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

module.exports = router;
