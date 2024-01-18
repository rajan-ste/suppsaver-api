const User = require('../models/user.model.js');

exports.createUser = (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.create(newUser, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        } else {
            res.status(201).send(data);
        }
    });
};
