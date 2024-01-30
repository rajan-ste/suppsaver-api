module.exports = app => {
    const companies = require("../controllers/company.controller.js");
    const { authenticateApiKey } = require("../middleware/authentication.js")
  
    var router = require("express").Router();
  
    // Retrieve all companies
    router.get("/", companies.findAll);
  
    // Retrieve a single company with id
    router.get("/:id", companies.findByID);
  
    // Update a company with id
    router.put("/:id", authenticateApiKey, companies.update);
  
    app.use('/api/companies', router);
  };