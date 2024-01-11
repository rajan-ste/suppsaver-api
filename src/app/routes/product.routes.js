module.exports = app => {
    const products = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Product
    router.post("/", products.create);
  
    // Retrieve all products
    router.get("/", products.findProds);

    // Retrieve all product_company entries
    router.get("/product-company", products.findAll);
  
    // Retrieve a single Product with id
    router.get("/:companyid/:productid", products.findByID);
  
    // Update a Product with id
    router.put("/:companyid/:productid", products.update);
  
    // Delete a Product with id
    router.delete("/:companyid/:productid", products.delete);

    // Automate price updates
    router.put('/update-price', products.updatePrice);
  
    app.use('/api/products', router);
  };