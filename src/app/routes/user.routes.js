module.exports = app => {
    const users = require("../controllers/user.controller.js");
  
    var router = require("express").Router();

    // Create a user 
    router.post("/", users.createUser);
  

  
    app.use('/api/users', router);
  };