var express = require("express");
var router = express.Router();

const auth = require('../auth');
const db = require('../models/index');
const User = db.users;
const Role = db.roles;
const Products = db.products;

var bcrypt = require('bcryptjs');

/* GET home page. */
router.get("/", function (req, res, next) {
  Products.findAll()
    .then((data) => {
      res.render("home", {
        pageTitle: "Daftar product Saat ini",
        products: data,
        session: req.session
      });
    })

    .catch((err) => {
      res.render("home", {
        pagetitle: "Daftar product Saat ini",
        products: [],

      });
    });
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "Express",
    session: req.session
  });
});

router.get("/register", function (req, res, next) {
  res.render("register", {
    title: "Express",
    session: req.session
  });
});

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/login');
});

router.get("/addrole", function (req, res, next) {
  res.render("addrole", { title: "Add role" });
});

router.post('/addrole', function (req, res, next) {
  var role = {
    name: req.body.name,
  }
  Role.create(role)
    .then(data => {
      res.redirect('/login');
    })
    .catch(err => {
      res.render('register', {
        title: 'Form Register'
      });
    });
});


router.post('/register', function (req, res, next) {
  var hashpass = bcrypt.hashSync(req.body.password, 8);
  var user = {
    name: req.body.fullname,
    email: req.body.email,
    username: req.body.username,
    password: hashpass,
    lat: req.body.lat,
    lon: req.body.lon
  }
  User.create(user)
    .then(data => {
      res.redirect('/login');
    })
    .catch(err => {
      res.render('register', {
        title: 'Form Register'
      });
    });
});

router.post('/login', function (req, res, next) {
  if (!req.body.username) {
    req.flash("error", "Please input the username");
    return res.redirect("/login");
  } else if (!req.body.password) {
    req.flash("error", "Please input the password");
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
