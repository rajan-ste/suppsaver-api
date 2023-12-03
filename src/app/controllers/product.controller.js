const Product = require("../models/product.model.js");

// Create and Save a new Product
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
      }
    
      const product = new Product({
        Name: req.body.Name,
        Type: req.body.Type,
        Price: req.body.Price,
        Image: req.body.Image,
        Store: req.body.Store,
        URL: req.body.URL
      });
    
      Product.create(product, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Error occurred while creating the product."
          });
        else res.send(data);
      });
};

// Retrieve all Products
exports.findAll = (req, res) => {

  Product.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Error occurred while retrieving products."
      });
    else res.send(data);
  });
};

// Find a single product with a id
exports.findByID = (req, res) => {

  Product.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving product with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// Update a product identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Product.updateById(
    req.params.id,
    new Product(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Product with id ${req.params.id} not found.`
          });
        } else {
          res.status(500).send({
            message: "Error updating product with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a product with the specified id in the request
exports.delete = (req, res) => {
  Product.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete product with id " + req.params.id
        });
      }
    } else res.send({ message: `product was deleted successfully!` });
  });
};

