module.exports = app => {
    const companies = require("../controllers/company.controller.js");
  
    var router = require("express").Router();
  
    // Retrieve all Products
    router.get("/", companies.findAll);
  
    // Retrieve a single Product with id
    router.get("/:id", companies.findByID);
  
    // Update a Product with id
    router.put("/:id", companies.update);
  
    app.use('/api/companies', router);
  };