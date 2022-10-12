var express = require("express");
var router = express.Router();

const db = require("../models/index");
const Products = db.products
const Reviews = db.reviews
const Op = db.Sequelize.Op;



//get all products
router.get("/", function (req, res, next) {
  Products.findAll()
    .then((data) => {
      res.render("home", {
        pageTitle: "Daftar product Saat ini",
        products: data,
      });
    })

    .catch((err) => {
      res.render("home", {
        pagetitle: "Daftar product Saat ini",
        products: [],
      });
    });
});

//detail by params
router.get("/detail/:id", async function (req, res, next) {
  const id = parseInt(req.params.id);

  const isiReviews = await Reviews.findAll({
    where : {
      id_product: id
    }
  });
  await Products.findByPk(id)
    .then((datadetail) => {
      if (datadetail) {
        res.render("productDetail", {
          pagetitle: "product Saat ini",
          products: datadetail,
          reviews : isiReviews
        });
      } else {
        // http 404 not found
        res.render("productDetail", {
          pagetitle: "product Saat ini",
          products: {},
        });
      }
    })
    .catch((err) => {
      res.render("productDetail", {
        pagetitle: "product Saat ini",
        products: [],
      });
    });
});

//add Komentar
router.post("/addreviews", function (req, res, next) {
  
  let reviews = {
    id_product : req.body.id_product,
    //id_user : req.body.id_user,
    score: req.body.score,
    comment: req.body.comment
  };
  Reviews.create(reviews)
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
  res.render("addProduct", {
    pageTitle: 'Tambah product',
    //path: 'products/add',
    editing: false,
    hasError: false,
    errorMessage: null,
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
    rating : null
  };
  
  if (!products.image) {
    return res.status(422).render("addProducts", {
      pageTitle: 'Tambah product',
      //path: 'products/add',
      editing: false,
      hasError: true,
      products : {
        name: req.body.name,
        description: req.body.description,
        quantity: req.body.quantity,
        price: req.body.price,
        
      },
      errorMessage: 'file yang dikirim harus disertai gambar, harus format png/jpeg/jpg',
    });
  }
  var image = products.image.path
  var image2 = image.replace(/\\/g, "/")

  //var rating2 = 

  products = {
    name: req.body.name,
    image: image2,
    description: req.body.description,
    quantity: req.body.quantity,
    price: req.body.price,
    rating: null
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

// //edit product, data di ambil
// router.get("/editproducts/:id", function (req, res, next) {
//   const id = parseInt(req.params.id);
 
//   Products.findByPk(id)
//     .then((dataEdit) => {
//       if (dataEdit) {
//         res.render("editProducts", {
//           pageTitle: "Edit product",
//           hasError: false,
//           errorMessage: null,
//           products: dataEdit,
//         });
//       } else {
//         // http 404 not found
//         res.redirect("/");
        
//       }
//     })
//     .catch((err) => {
//       res.json({
//         info: "Error",
//         message: err.message,
//       });
//     });
// });

// //Edit products akan di Post
// router.post("/editproducts/:id", function (req, res, next) {
//   const id = parseInt(req.params.id);
//   let products = {
//     name: req.body.name,
//     image: req.file,
//     description: req.body.description,
//     quantity: req.body.quantity,
//     price: req.body.price,
//     rating: req.body.rating,
//   };
//   if (!products.image) {
//     return res.status(422).render("editProducts", {
//       pageTitle: 'Edit product',
//       path: 'editproducts',
//       editing: true,
//       hasError: true,
//       products : {
//         name: req.body.name,
//         description: req.body.description,
//         quantity: req.body.quantity,
//         price: req.body.price,
//         rating: req.body.rating,
//       },
//       errorMessage: 'file yang dikirim harus disertai gambar, harus format png/jpeg/jpg',
//     });
//   }

//   var image = products.image.path
//   var image2 = image.replace(/\\/g, "/")
//   products = {
//     name: req.body.name,
//     image: image2,
//     description: req.body.description,
//     quantity: req.body.quantity,
//     price: req.body.price,
//     rating: req.body.rating,
//   };

//   Products.update(products, {
//     where: { id: id },
//   })
//     .then((num) => {
//       res.redirect("/");
//     })
//     .catch((err) => {
//       res.json({
//         info: "Error",
//         message: err.message,
//       });
//     });
// });


// //Delete products
// router.get("/delete/:id", function (req, res, next) {
//   const id = parseInt(req.params.id);

//   Products.destroy({
//     where: { id: id}
//   })
//     .then((datadetail) => {
//       if (datadetail) {
//         res.redirect('/')
//       } else {
//         // http 404 not found
//         res.status(404).send({
//         message: "tidak ada ada id=" + id
//       })
//       }
//     })
//     .catch((err) => {
//       res.render("productsDetail", {
//         pagetitle: "Daftar Produk",
//         products: {},
//       });
//     });
// });



module.exports = router;
