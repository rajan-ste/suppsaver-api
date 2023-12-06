const sql = require("./db.js");
const stringSimilarity = require('string-similarity');

// Constructor
const Product = function(product) {
  this.productname = product.productname;
  this.companyid = product.companyid;
  this.price = product.price;
  this.image = product.image;
  this.link = product.link;
};

// Method to check if a similar product name already exists
Product.findMostSimilar = (inputString) => {
  return new Promise((resolve, reject) => {
      const query = "SELECT id, name FROM product";
      sql.query(query, (err, rows) => {
          if (err) {
              reject(err);
              return;
          }

          // Ensure inputString is a string
          if (typeof inputString !== 'string') {
              console.log(inputString);
              reject(new Error("Input string must be a string"));
              return;
          }

          // Ensure we have an array of strings to compare against
          const names = rows.map(row => row.name);
          if (!Array.isArray(names) || !names.every(name => typeof name === 'string')) {
              reject(new Error("Comparison array must be an array of strings"));
              return;
          }

          const bestMatch = stringSimilarity.findBestMatch(inputString, names);

          if (bestMatch.bestMatch.rating >= 0.8) { // Using 0.8 as a threshold
              resolve(rows[bestMatch.bestMatchIndex].id);
          } else {
              resolve(0);
          }
      });
  });
};


// Method to create new products and insert them into product_company
Product.create = async (products, result) => {
  try {
      // Ensure 'products' is always an array
      if (!Array.isArray(products)) {
          products = [products];
      }

      const productCreationPromises = products.map(async newProduct => {
          console.log("Processing Product:", newProduct);

          // Check for a similar product
          const similarProductId = await Product.findMostSimilar(newProduct.productname);
          let productId;

          if (similarProductId === 0) {
              // Insert new product into the product table
              const insertProductQuery = "INSERT INTO product (name) VALUES (?)";
              const productInsertion = await new Promise((resolve, reject) => {
                  sql.query(insertProductQuery, [newProduct.productname], (err, res) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(res.insertId);
                      }
                  });
              });
              productId = productInsertion;
          } else {
              productId = similarProductId; // Use the ID of the existing similar product
          }

          // Prepare the product_company object
          const productCompanyData = {
              productid: productId,
              companyid: newProduct.companyid,
              price: newProduct.price,
              image: newProduct.image,
              link: newProduct.link
          };

          // Insert into product_company
          return new Promise((resolve, reject) => {
              const insertProductCompanyQuery = "INSERT INTO product_company SET ?";
              sql.query(insertProductCompanyQuery, productCompanyData, (err, res) => {
                  if (err) {
                      reject(err);
                  } else {
                      resolve({ id: res.insertId, ...productCompanyData });
                  }
              });
          });
      });

      // Wait for all product creations to complete
      const createdProducts = await Promise.all(productCreationPromises);
      result(null, createdProducts);
  } catch (err) {
      console.log("error: ", err);
      result(err, null);
  }
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
      "UPDATE product_company SET price = ?, image = ?, link = ?, WHERE productid = ? AND companyid = ?",
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