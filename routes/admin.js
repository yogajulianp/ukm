const { text } = require("express");
var express = require("express");
const session = require("express-session");
var router = express.Router();
var bcrypt = require("bcryptjs");

const auth = require("../auth");
const db = require("../models/index");
const user = require("../models/user");
const User = db.users;
const Ukm = db.ukms;
const Role = db.roles;
const Products = db.products;
const Categories = db.category;

var bcrypt = require('bcryptjs');

router.get("/", auth, function (req, res, next) {
  const requsername = req.session.username;
  User.findOne({ where: { username: requsername } })
    .then(data => {
      var cekukmId = data.ukmId;
      if (cekukmId == null) {
        res.redirect("/admin/regisukm")
      } else {
        res.render("admin/dashboard")
      }
    })
});

router.get('/regisukm', function (req, res, next) {
  res.render("admin/regisukm")
});

router.post("/regisukm", function (req, res, next) {
  const requsername = req.session.username;
  User.findOne({ where: { username: requsername } })
    .then(data => {
      if (data) {
        var userId = data.id
        var ukm = {
          name: req.body.name,
          description: req.body.description,
          address: req.body.address,
          userId: userId
        }
        Ukm.create(ukm)
          .then(dataukm => {
            if (dataukm) {
              User.update({
                ukmId: dataukm.id,
                roleId: 2
              }, {
                where: { id: userId }
              })
              res.redirect("/admin");
            }
          })
          .catch((err) => {
            res.json({
              info: "Error",
              message: err.message,
            });
          });
      }
    })
});

// UKM Page
// My Products
// router.get("/products", function (req, res, next) {
//   Products.findAll()
//     .then((data) => {
//       res.render("admin/products", {
//         pageTitle: "Daftar product Saat ini",
//         products: data,
//       });
//     })
//     .catch((err) => {
//       res.render("admin/products", {
//         pageTitle: err,
//         products: [],
//       });
//     });
// });

router.get("/products", async function (req, res, next) {
  const categoryList = await Categories.findAll();
  await Products.findAll({
    include: Categories,
    order: [
      ['createdAt', 'DESC']
    ]
  })
    .then((data) => {
      console.log(data)
      res.render("admin/products", {
        pageTitle: "Daftar product Saat ini",
        products: data,
        categories: categoryList,
      });
    })
    .catch((err) => {
      res.render("admin/products", {
        pagetitle: "Daftar product Saat ini",
        products: [],
      });
    });
});

router.get("/add_products", function (req, res, next) {
  //res.render("admin/products_add");
  Categories.findAll({ attributes: ["id", "category"] }).then((categories) => {
    //console.log(categories)
    res.render("admin/products_add", {
      pageTitle: "Tambah product",
      path: "/admin/add_products",
      editing: false,
      hasError: false,
      errorMessage: null,
      session: req.session,
      categories,
    });
  });
});

//add product
router.post("/add_products", function (req, res, next) {
  let products = {
    name: req.body.name,
    image: req.file,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    rating: null,
    category_fk: req.body.category_fk,
  };

  if (!products.image || !products.quantity || !products.image || !products.description || !products.price || !products.name) {
    Categories.findAll({ attributes: ["id", "category"] })
      .then((categories) => {
        console.log(categories)
        return res.status(422).render("admin/products_add", {
          pageTitle: "Tambah product",
          path: "/admin/add_products",
          editing: false,
          hasError: true,
          session: req.session,
          categories,
          products: {
            name: req.body.name,
            description: req.body.description,
            quantity: req.body.quantity,
            price: req.body.price,
          },
          errorMessage:
            "file yang dikirim harus disertai gambar, harus format png/jpeg/jpg",
        });
      });
    return res.redirect("/admin/add_products");
  }

  var image = products.image.path;
  var image2 = image.replace(/\\/g, "/");

  //var rating2 =

  products = {
    name: req.body.name,
    image: image2,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    rating: null,
    category_fk: req.body.category_fk,
  };
  Products.create(products)
    .then((addData) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});



//edit product, data di ambil
router.get("/edit_products", async function (req, res, next) {
  // const id = parseInt(req.params.id);
  const id = parseInt(req.query.id)
  let viewsData = {
    pageTitle: "Edit product",
    path: `admin/edit_products/${id}`,
    editing: true,
    hasError: false,
    errorMessage: null,
    session: req.session,
  };

  await Products.findByPk(id)
    .then((products) => {
      viewsData = { ...{ products }, ...viewsData };
      return Categories.findAll({ attributes: ["id", "category"] });
    })
    .then((categories) => {
      viewsData = { ...{ categories }, ...viewsData };
      res.render("admin/products_edit", viewsData);
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

//Edit products akan di Post
router.post("/edit_products", async function (req, res, next) {
  //const id = parseInt(req.params.id);
  const id = parseInt(req.query.id)

  let products = {
    name: req.body.name,
    image: req.file,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    rating: null,
    category_fk: req.body.category_fk,
  };

  if (!products.image || !products.quantity || !products.image || !products.description || !products.price || !products.name) {
    // return res.status(422).render("editProduct", {
    //   pageTitle: "Edit product",
    //   path: `products/edit/${id}`,
    //   editing: true,
    //   hasError: true,
    //   session: req.session,
    //   products: {
    //     name: req.body.name,
    //     description: req.body.description,
    //     quantity: req.body.quantity,
    //     price: req.body.price,
    //   },
    //   errorMessage:
    //     "file yang dikirim harus disertai gambar, harus format png/jpeg/jpg",
    // });
    return res.redirect(`edit_products?id=${id}`);
  }

  var image = products.image.path;
  var image2 = image.replace(/\\/g, "/");
  products = {
    name: req.body.name,
    image: image2,
    description: req.body.description,
    quantity: req.body.quantity,
    rating: null,
    price: req.body.price,
    category_fk: req.body.category_fk,
  };

  await Products.update(products, {
    where: { id: id },
  })
    .then((num) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});


router.get("/delete_products", function (req, res, next) {
  const id = parseInt(req.query.id);

  Products.destroy({
    where: { id: id },
  })
    .then((datadetail) => {
      if (datadetail) {
        res.redirect("/admin/products");
      } else {
        // http 404 not found
        res.status(404).send({
          message: "tidak ada ada id=" + id,
        });
      }
    })
    .catch((err) => {
      res.render("productsDetail", {
        pagetitle: "Daftar Produk",
        products: {},
      });
    });
});

//My Transactions
router.get("/transactions", function (req, res, next) {
  res.render("admin/transactions");
});

//My UKM
router.get("/ukm", function (req, res, next) {
  Ukm.findAll({ where: { userId: req.session.userId } })
    .then((data) => {
      if (data == "") {
        res.render("admin/ukm", {
          pageTitle: "Belum Ada UKM.",
          data: 0,
        });
      } else {
        res.render("admin/ukm", {
          pageTitle: "UKM",
          data: data[0],
        });
      }
    })
    .catch((err) => {
      res.render("admin/ukm", {
        pageTitle: err,
        products: [],
      });
    });
});

router.get("/edit_ukm/:id", function (req, res, next) {
  const id = parseInt(req.params.id);
  Ukm.findByPk(id)
    .then(detailukm => {
      if (detailukm) {
        res.render('admin/ukm_edit', {
          pageTitle: 'Edit UKM',
          id: detailukm.id,
          name: detailukm.name,
          address: detailukm.address,
          description: detailukm.description,
        });
      } else {
        // http 404 not found
        res.redirect('/admin/ukm');
      }
    })
    .catch(err => {
      res.redirect('/admin/ukm');
    });
});

router.post("/edit_ukm/:id", function (req, res, next) {
  const id = parseInt(req.params.id);
  Ukm.update({
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
  },
    { where: { id: id } })
    .then(() => {
      res.redirect("ukm");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

// Admin Page
// Users
router.get("/users", function (req, res, next) {
  User.findAll()
    .then((data) => {
      res.render("admin/users", {
        pageTitle: "Daftar User",
        users: data,
      });
    })

    .catch((err) => {
      res.render("admin/users", {
        pageTitle: err,
        users: [],
      });
    });
});

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
          req.session.userId = data.id;
          res.redirect('/admin');
        } else {
          res.redirect('/admin/login');
        }
      } else {
        res.redirect('/login');
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });
});

module.exports = router;
