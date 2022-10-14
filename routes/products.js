var express = require("express");
const categories = require("../models/categories");
var router = express.Router();

const db = require("../models/index");
const Products = db.products;
const Reviews = db.reviews;
const Category = db.category;
const Op = db.Sequelize.Op;

const {
  body,
  check,
  validationResult
} = require('express-validator');
const session = require("express-session");

//get all products
router.get("/", async function (req, res, next) {
  const categoryList = await Category.findAll();
  await Products.findAll({
    include : Category,
    order: [
      ['createdAt', 'DESC']
    ]
  })
    .then((data) => {
      console.log(data)
      res.render("home", {
        pageTitle: "Daftar product Saat ini",
        products: data,
        session: req.session,
        categories: categoryList,
      });
    })
    .catch((err) => {
      res.render("home", {
        pagetitle: "Daftar product Saat ini",
        session: req.session,
        products: [],
      });
    });
});

//get all category on menu
router.get("/", async function (req, res, next) {
  await Category.findAll()
    .then((data) => {
      res.render("templates/sidebar", {
        categories: data,
        session: req.session,
      });
    })
    .catch((err) => {
      res.render("templates/sidebar", {
        categories: [],
      });
    });
});

//get all category on menu detail products
// router.get("/detail/:id", async function (req, res, next) {

//   await Category.findAll()
//     .then((data) => {
//       res.render("templates/sidebar", {
//        session: req.session
//         categories: data,
//       });
//     })
//     .catch((err) => {
//       res.render("templates/sidebar", {

//         categories: [],
//       });
//     });
// });

//detail by params
router.get("/detail/:id", async function (req, res, next) {
  const id = parseInt(req.params.id);
  if (session.username) {
    let username = req.body.username
  }
  const categoryList = await Category.findAll();
  const isiReviews = await Reviews.findAll({
    where: {
      id_product: id,
    },
  });
  await Products.findByPk(id)
    .then((datadetail) => {
      if (datadetail) {
        res.render("productDetail", {
          pagetitle: "product Saat ini",
          products: datadetail,
          reviews: isiReviews,
          session: req.session,
          categories: categoryList,
        });
      } else {
        // http 404 not found
        res.render("productDetail", {
          pagetitle: "product Saat ini",
          session: req.session,
          products: {},
        });
      }
    })
    .catch((err) => {
      res.render("productDetail", {
        pagetitle: "product Saat ini",
        session: req.session,
        products: [],
      });
    });
});

//add Komentar
router.post("/addreviews", async function (req, res, next) {
  let reviews = {
    id_product: req.body.id_product,
    //id_user : req.body.id_user,
    score: req.body.score,
    comment: req.body.comment,
  };
  await Reviews.create(reviews)
    .then((addData) => {
      res.redirect(`/products/detail/${req.body.id_product}`);
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

//add product
router.get("/add", function (req, res, next) {
  Category.findAll({ attributes: ["id", "category"] }).then((categories) => {
    //console.log(categories)
    res.render("addProduct", {
      pageTitle: "Tambah product",
      path: "/products/add",
      editing: false,
      hasError: false,
      errorMessage: null,
      session: req.session,
      categories,
    });
  });
});

//add product
router.post("/add", function (req, res, next) {
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
    Category.findAll({ attributes: ["id", "category"] })
    .then((categories) => {
      console.log(categories)
      return res.status(422).render("addProduct", {
        pageTitle: "Tambah product",
        path: "/products/add",
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
    return res.redirect("/products/add");
    // const categories = Category.findAll({attributes: ['id', 'category']})
    // return res.status(422).render("addProduct", {
    //   pageTitle: 'Tambah product',
    //   path: '/products/add',
    //   editing: false,
    //   hasError: true,
    //   session: req.session,
    //   products: {
    //     name: req.body.name,
    //     description: req.body.description,
    //     quantity: req.body.quantity,
    //     price: req.body.price,

    //   },
    //   categories,
    //   errorMessage: 'file yang dikirim harus disertai gambar, harus format png/jpeg/jpg',
    // });
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
      res.redirect("/products");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

//edit product, data di ambil
router.get("/edit/:id", function (req, res, next) {
  const id = parseInt(req.params.id);
  let viewsData = {
    pageTitle: "Edit product",
    path: `products/edit/${id}`,
    editing: true,
    hasError: false,
    errorMessage: null,
    session: req.session,
  };

  Products.findByPk(id)
    .then((products) => {
      viewsData = { ...{ products }, ...viewsData };
      return Category.findAll({ attributes: ["id", "category"] });
    })
    .then((categories) => {
      viewsData = { ...{ categories }, ...viewsData };
      res.render("editProduct", viewsData);
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

//Edit products akan di Post
router.post("/edit/:id", function (req, res, next) {
  const id = parseInt(req.params.id);
  let products = {
    name: req.body.name,
    image: req.file,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    rating: null,
    category_fk: req.body.category_fk,
  };
  
  if (!products.image || !products.quantity || !products.image || !products.description || !products.price || !products.name  ) {
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
    return res.redirect(`/products/edit/${id}`);
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

  Products.update(products, {
    where: { id: id },
  })
    .then((num) => {
      res.redirect("/products");
    })
    .catch((err) => {
      res.json({
        info: "Error",
        message: err.message,
      });
    });
});

//Delete products
router.get("/delete/:id", function (req, res, next) {
  const id = parseInt(req.params.id);

  Products.destroy({
    where: { id: id },
  })
    .then((datadetail) => {
      if (datadetail) {
        res.redirect("/");
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

module.exports = router;
