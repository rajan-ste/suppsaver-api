const sql = require("./db.js");
const stringSimilarity = require('string-similarity');

// Constructor
const Product = function(product) {
  this.productname = product.productname.replace(/pre[- ]workout/gi, '').trim().toLowerCase();
  this.companyid = product.companyid;
  this.price = product.price;
  this.image = product.image;
  this.link = product.link;
};

// Method to check if a similar product name already exists
Product.findMostSimilar = async (newProducts) => {
  const query = "SELECT id, name FROM product";
  const dbProducts = await new Promise((resolve, reject) => {
      sql.query(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
      });
  });

  return newProducts.map(newProduct => {
      let highestMatch = { id: null, score: 0 };

      // find the best match currently in the database
      for (let dbProduct of dbProducts) {
          let score = stringSimilarity.compareTwoStrings(newProduct.productname, dbProduct.name);
          if (score > highestMatch.score) {
              highestMatch = { id: dbProduct.id, score };
          }
      }

      // Round the score to two decimal places
      highestMatch.score = parseFloat(highestMatch.score.toFixed(2));

      return { ...newProduct, matchId: highestMatch.id, matchScore: highestMatch.score };
  });
};

// Method to create new products and insert them into product_company
Product.create = async (newProducts, result) => {
  try {
      if (!Array.isArray(newProducts)) {
          newProducts = [newProducts];
      }

      const matchedProducts = await Product.findMostSimilar(newProducts);

      for (let product of matchedProducts) {
          let productId;

          // If the product has a match in the database and the score is above the threshold
          if (product.matchId && product.matchScore > 0.7) {
              productId = product.matchId;
          } else {
              // Insert new product into the product table
              const insertProductQuery = "INSERT INTO product (name, image) VALUES (?, ?)";
              const productInsertion = await new Promise((resolve, reject) => {
                  sql.query(insertProductQuery, [product.productname, product.image], (err, res) => {
                      if (err) reject(err);
                      else resolve(res.insertId);
                  });
              });
              productId = productInsertion; 
          }

          // Insert into product_company table
          const insertProductCompanyQuery = `
            INSERT INTO product_company (productid, companyid, price, image, link, score, product_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
          await new Promise((resolve, reject) => {
              sql.query(insertProductCompanyQuery, [
                  productId, 
                  product.companyid, 
                  product.price, 
                  product.image, 
                  product.link, 
                  parseFloat(product.matchScore).toFixed(2), // Round score to 2 decimal places
                  product.productname // Insert product name
              ], (err, res) => {
                  if (err) reject(err);
                  else resolve(res);
              });
          });

          console.log("Inserted Product:", { productid: productId, ...product });
      }

      result(null, matchedProducts);
  } catch (err) {
      console.log("Error in creating products:", err);
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

  Product.updateProductPrice = (products, result) => {
    let updatePromises = products.map(product => {
        const { productname, companyid, price } = product;
        return new Promise((resolve, reject) => {
            const query = "UPDATE product_company SET price = ? WHERE product_name = ? AND companyid = ?";
            sql.query(query, [price, productname.toLowerCase().replace(/pre[- ]workout/gi, '').trim(), companyid], (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (res.affectedRows === 0) {
                    resolve({ kind: "not_found", productname });
                } else {
                    resolve({ id: res.insertId, productname, price });
                }
            });
        });
    });

    Promise.allSettled(updatePromises)
        .then(results => result(null, results))
        .catch(err => result(err, null));
};

Product.getProds = (result) => {
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

Product.search = (searchTerm, result) => {
  
  let query = "SELECT * FROM product WHERE name LIKE ?";

  let formattedSearchTerm = `${searchTerm}%`;

  sql.query(query, [formattedSearchTerm], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("products: ", res);
    result(null, res);
  });
};



module.exports = Product;