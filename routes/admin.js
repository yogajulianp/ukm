var express = require("express");
var router = express.Router();


const auth = require('../auth');
const db = require("../models/index");
const User = db.users;
const Ukm = db.ukms;
const Role = db.roles;
const Products = db.products;
const Categories = db.category;

router.get("/", function (req, res, next) {
    res.render("admin/dashboard");

});

router.get("/products", function (req, res, next) {
    Products.findAll()
        .then((data) => {
            res.render("admin/products", {
                pageTitle: "Daftar product Saat ini",
                products: data,
            });
        })
        .catch((err) => {
            res.render("admin/products", {
                pageTitle: err,
                products: [],
            });
        });
});

// Admin Page
// Categories
router.get("/categories", function (req, res, next) {
    Categories.findAll()
        .then((data) => {
            res.render("admin/categories", {
                pageTitle: "Daftar Kategori",
                categories: data,
            });
        })

        .catch((err) => {
            res.render("admin/categories", {
                pageTitle: err,
                categories: [],
            });
        });
});

router.get("/add_categories", function (req, res, next) {
    res.render("admin/categories_add");
});

router.post("/add_categories", function (req, res, next) {
    Categories.create({ category: req.body.category })
        .then((addData) => {
            res.redirect("categories");
        })
        .catch((err) => {
            res.json({
                info: "Error",
                message: err.message,
            });
        });
});

router.get("/edit_categories", async (req, res, next) => {
    const id = parseInt(req.query.id);
    await Categories.findByPk(id)
        .then((data) => {
            if (data) {
                res.render("admin/categories_edit", {
                    pagetitle: "Edit Kategori",
                    item: data,
                });
            } else {
                // http 404 not found
                res.render("admin/categories_edit", {
                    pagetitle: "Edit Kategori",
                    item: {},
                });
            }
        })
        .catch((err) => {
            res.render("admin/categories_edit", {
                pagetitle: "Edit Kategori",
                error: err,
                item: [],
            });
        });
});

router.post("/edit_categories", function (req, res, next) {
    Categories.update(
        { category: req.body.category },
        { where: { id: req.body.id } }
    )
        .then(() => {
            res.redirect("categories");
        })
        .catch((err) => {
            res.json({
                info: "Error",
                message: err.message,
            });
        });
});

router.get("/delete_categories", function (req, res, next) {
    var id = parseInt(req.query.id);
    Categories.destroy({ where: { id: id } });
    res.redirect("categories");
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
