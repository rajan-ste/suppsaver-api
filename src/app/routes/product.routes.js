module.exports = app => {
  const products = require("../controllers/product.controller.js");
  const { authenticateApiKey } = require('../middleware/authentication.js');

  var router = require("express").Router();

  // Create a new Product
  router.post("/", authenticateApiKey, products.create);

  // Retrieve all products
  router.get("/", products.findProds);

  // Retrieve all product_company entries
  router.get("/product-company", products.findAll);

  // Retrieve a single Product with id
  router.get("/:companyid/:productid", products.findByID);

  // Update a Product with id
  router.put("/:companyid/:productid", authenticateApiKey, products.update);

  // Delete a Product with id
  router.delete("/:companyid/:productid", authenticateApiKey, products.delete);

  // Automate price updates
  router.put('/update-price', authenticateApiKey, products.updatePrice);

  // Search for products
  router.get('/search', products.searchProds);

  app.use('/api/products', router);
};
