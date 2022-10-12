var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {    
    res.render("admin/dashboard");
});


router.get("/login", function (req, res, next) {    
    res.render("admin/login");
});

module.exports = router;