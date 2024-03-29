const Watchlist = require('../models/watchlist.model.js');

exports.create = (req, res) => {
    const newEntry = new Watchlist({
        userId: req.userId, // This should be extracted from JWT token
        productId: req.body.productid
    });

    Watchlist.create(newEntry, (err, data) => {
        console.log(newEntry)
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Watchlist entry."
            });
        } else {
            
            res.status(201).send(data);
        }
    });
};

exports.findById = (req, res) => {
    Watchlist.findByUserId(req.userId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Watchlist Not found with user ID ${req.userId}.`
                });
            } else {
                res.status(500).send({
                    message: `Error retrieving Watchlist with user ID ${req.userId}`
                });
            }
        } else {
            res.send(data);
        }
    });
};

exports.delete = (req, res) => {
    const entryToDelete = new Watchlist({
        userId: req.userId, 
        productId: req.body.productid
    });

    Watchlist.delete(entryToDelete, (err, data) => {
        console.log(entryToDelete)
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting the Watchlist entry."
            });
        } else {
            
            res.status(201).send(data);
        }
    });
};
