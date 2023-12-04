const Company = require("../models/company.model.js");

// Retrieve all Companies
exports.findAll = (req, res) => {

    Company.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Error occurred while retrieving companies."
        });
      else res.send(data);
    });
  };

// Find a single company with a id
exports.findByID = (req, res) => {

    Company.findById(req.params.id, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Company with id ${req.params.id} not found.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving company with id " + req.params.id
          });
        }
      } else res.send(data);
    });
  };

// Update a company identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
  
    console.log(req.body);
  
    Company.updateById(
      req.params.id,
      new Company(req.body),
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Company with id ${req.params.id} not found.`
            });
          } else {
            res.status(500).send({
              message: "Error updating company with id " + req.params.id
            });
          }
        } else res.send(data);
      }
    );
  };