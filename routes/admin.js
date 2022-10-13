var express = require("express");
var router = express.Router();


const auth = require('../auth');
const db = require("../models/index");
const Ukm = db.ukms;
const User = db.users;
const Op = db.Sequelize.Op;

router.get("/", auth, function (req, res, next) {
    res.render("admin/dashboard")
});


router.get("/login", function (req, res, next) {
    res.render("admin/login");
});

router.post("/login", function (req, res, next) {
    if (!req.body.username) {
        return res.redirect("/login");
    } else if (!req.body.password) {
        return res.redirect("/login");
    }
    User.findOne({ where: { username: req.body.username } })
        .then(data => {
            if (data) {
                var loginValid = bcrypt.compareSync(req.body.password, data.password);
                if (loginValid) {
                    req.session.islogin = true;
                    req.session.username = req.body.username;
                    res.redirect('/');
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
        })
        .catch(err => {
            res.redirect('/login');
        });
});

module.exports = router;