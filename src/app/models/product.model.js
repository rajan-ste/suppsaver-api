const sql = require("./db.js");

// constructor
const Product = function(product) {
  this.id = product.id;
  this.Name = product.Name;
  this.Type = product.Type;
  this.Price = product.Price;
  this.Image = product.Image;
  this.Store = product.Store;
  this.URL = product.URL;
};

Product.create = (newProduct, result) => {
    sql.query("INSERT INTO product SET ?", newProduct, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created product: ", { id: res.insertId, ...newProduct });
      result(null, { id: res.insertId, ...newProduct });
    });
  };

Product.findById = (id, result) => {
    sql.query("SELECT * FROM product WHERE id = ?", [id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);  
        return;
      }
  
      if (res.length) {
        console.log("found product: ", res[0]);
        result(null, res[0]);
        return;
      }
  
      result({ kind: "not_found" }, null);
    });
  };

Product.getAll = (result) => {
    let query = "SELECT * FROM product";
  
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log("products: ", res);
      result(null, res);
    });
  };

Product.updateById = (id, product, result) => {
    sql.query(
      "UPDATE product SET Name = ?, Type = ?, Price = ?, Image = ?, Store = ?, URL = ? WHERE id = ?",
      [product.Name, product.Type, product.Price, product.Image, product.Store, product.URL, id],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
  
        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }
  
        console.log("updated product: ", { id: id, ...product });
        result(null, { id: id, ...product });
      }
    );
  };

Product.remove = (id, result) => {
    sql.query("DELETE FROM product WHERE ID = ?", [id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
  
      console.log(`deleted product with id: ${id} `);
      result(null, res);
    });
  };

  
module.exports = Product;