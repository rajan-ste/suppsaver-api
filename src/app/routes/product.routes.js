module.exports = app => {
    const products = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Product
    router.post("/", products.create);
  
    // Retrieve all Products
    router.get("/", products.findAll);
  
    // Retrieve a single Product with id
    router.get("/:companyid/:productid", products.findByID);
  
    // Update a Product with id
    router.put("/:companyid/:productid", products.update);
  
    // Delete a Product with id
    router.delete("/:companyid/:productid", products.delete);

    router.put('/update-price', productController.updatePrice);
  
    app.use('/api/products', router);
  };