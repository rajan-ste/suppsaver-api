const sql = require("./db.js");

// constructor
const Product = function(product) {
  this.prodId = product.productid;
  this.companyId = product.companyid;
  this.price = product.price;
  this.image = product.image;
  this.link = product.link;
  this.group = product.group;
};

Product.create = (newProduct, result) => {
    sql.query("INSERT INTO product_company SET ?", newProduct, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created product: ", { id: res.insertId, ...newProduct });
      result(null, { id: res.insertId, ...newProduct });
    });
  };

Product.findById = (prodId, companyId, result) => {
    sql.query("SELECT * FROM product_company WHERE productid = ? AND companyid = ?", [prodId, companyId], (err, res) => {
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
    let query = "SELECT * FROM product_company";
  
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

Product.updateById = (prodId, companyId, product, result) => {
    sql.query(
      "UPDATE product_company SET price = ?, image = ?, link = ?, `group` = ? WHERE productid = ? AND companyid = ?",
      [product.price, product.image, product.link, product.group, prodId, companyId],
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
  
        console.log("updated product: ", { id: prodId, ...product });
        result(null, { id: prodId, ...product });
      }
    );
  };

Product.remove = (prodId, companyId, result) => {
    sql.query("DELETE FROM product_company WHERE productid = ? AND companyid = ?", [prodId, companyId], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
  
      console.log(`deleted from product_company with id: ${prodId, companyId} `);
      result(null, res);
    });
  };

module.exports = Product;