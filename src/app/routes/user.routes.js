module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const authenticateUser = require("../middleware/authentication.js")
    const jwt = require('jsonwebtoken');
  
    var router = require("express").Router();

    // Create a user 
    router.post("/", users.createUser);

    // Authenticate a user
    router.post('/login', authenticateUser, (req, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id }, process.env.JWT_KEY);
      res.json({ token });
  });
  
    app.use('/api/users', router);
  };