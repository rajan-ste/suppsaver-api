module.exports = app => {
    const products = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Product
    router.post("/", products.create);
  
    // Retrieve all Products
    router.get("/", products.findAll);
  
    // Retrieve a single Product with id
    router.get("/:productid/:companyid", products.findByID);
  
    // Update a Product with id
    router.put("/:productid/:companyid", products.update);
  
    // Delete a Product with id
    router.delete("/:productid/:companyid", products.delete);
  
    app.use('/api/products', router);
  };