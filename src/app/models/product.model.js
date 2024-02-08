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

// findMostSimilar method
Product.findMostSimilar = async (newProducts) => {
  const query = "SELECT id, name FROM product";
  const dbProducts = await new Promise((resolve, reject) => {
    sql.getConnection((err, connection) => {
      if (err) reject(err);

      connection.query(query, (err, rows) => {
        connection.release();

        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  return newProducts.map(newProduct => {
    let highestMatch = { id: null, score: 0 };

    for (let dbProduct of dbProducts) {
      let score = stringSimilarity.compareTwoStrings(newProduct.productname, dbProduct.name);
      if (score > highestMatch.score) {
        highestMatch = { id: dbProduct.id, score };
      }
    }

    highestMatch.score = parseFloat(highestMatch.score.toFixed(2));

    return { ...newProduct, matchId: highestMatch.id, matchScore: highestMatch.score };
  });
};

// create method
Product.create = async (newProducts, result) => {
  try {
    if (!Array.isArray(newProducts)) {
      newProducts = [newProducts];
    }

    const matchedProducts = await Product.findMostSimilar(newProducts);

    for (let product of matchedProducts) {
      let productId;

      if (product.matchId && product.matchScore > 0.7) {
        productId = product.matchId;
      } else {
        const insertProductQuery = "INSERT INTO product (name, image) VALUES (?, ?)";
        const productInsertion = await new Promise((resolve, reject) => {
          sql.getConnection((err, connection) => {
            if (err) reject(err);

            connection.query(insertProductQuery, [product.productname, product.image], (err, res) => {
              connection.release();

              if (err) reject(err);
              else resolve(res.insertId);
            });
          });
        });
        productId = productInsertion;
      }

      const insertProductCompanyQuery = `
        INSERT INTO product_company (productid, companyid, price, image, link, score, product_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await new Promise((resolve, reject) => {
        sql.getConnection((err, connection) => {
          if (err) reject(err);

          connection.query(insertProductCompanyQuery, [
            productId, 
            product.companyid, 
            product.price, 
            product.image, 
            product.link, 
            parseFloat(product.matchScore).toFixed(2), 
            product.productname 
          ], (err, res) => {
            connection.release();

            if (err) reject(err);
            else resolve(res);
          });
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

// findById method
Product.findById = (prodId, companyId, result) => {
    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        connection.query("SELECT * FROM product_company WHERE productid = ? AND companyid = ?", [prodId, companyId], (err, res) => {
            connection.release();

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
    });
};

// getAll method
Product.getAll = (result) => {
    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        connection.query("SELECT * FROM product_company", (err, res) => {
            connection.release();

            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            console.log("products: ", res);
            result(null, res);
        });
    });
};

// updateById method
Product.updateById = (prodId, companyId, product, result) => {
    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        connection.query(
            "UPDATE product_company SET price = ?, image = ?, link = ?, WHERE productid = ? AND companyid = ?",
            [product.price, product.image, product.link, prodId, companyId],
            (err, res) => {
                connection.release();

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
    });
};

// remove method
Product.remove = (prodId, companyId, result) => {
    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        connection.query("DELETE FROM product_company WHERE productid = ? AND companyid = ?", [prodId, companyId], (err, res) => {
            connection.release();

            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            console.log(`deleted from product_company with id: ${prodId, companyId}`);
            result(null, res);
        });
    });
};

// updateProductPrice method
Product.updateProductPrice = (products, result) => {
  // Step 1: Aggregate products by unique key and find the lowest price
  const productMap = new Map();

  products.forEach(product => {
    const { productname, companyid, price } = product;
    const key = `${productname.toLowerCase().replace(/pre[- ]workout/gi, '').trim()}-${companyid}`;

    if (!productMap.has(key) || productMap.get(key).price > price) {
      productMap.set(key, { productname, companyid, price });
    }
  });

  // Step 2: Create update promises for each unique product with the lowest price
  let updatePromises = Array.from(productMap.values()).map(({ productname, companyid, price }) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE product_company SET price = ? WHERE product_name = ? AND companyid = ?";
      
      sql.getConnection((err, connection) => {
        if (err) {
          console.log("error getting connection: ", err);
          reject(err);
          return;
        }

        console.log("Executing query:", query, [price, productname.replace(/pre[- ]workout/gi, '').trim().toLowerCase(), companyid]);

        connection.query(query, [price, productname.replace(/pre[- ]workout/gi, '').trim().toLowerCase(), companyid], (err, res) => {
          connection.release();

          if (err) {
            console.log("error executing query: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            console.log("No rows affected for product name:", productname);
            resolve({ kind: "not_found", productname });
          } else {
            console.log("Updated product price for:", productname, "New Price:", price);
            resolve({ id: res.insertId, productname, price }); // Note: insertId might not be relevant for an UPDATE operation
          }
        });
      });
    });
  });

  // Step 3: Wait for all update operations to complete
  Promise.allSettled(updatePromises)
    .then(results => {
      console.log("All lowest prices updated.");
      result(null, results);
    })
    .catch(err => {
      console.error("Error updating prices:", err);
      result(err, null);
    });
};


// getProds method
Product.getProds = (result) => {
  let query = "SELECT * FROM product";

  sql.getConnection((err, connection) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    connection.query(query, (err, res) => {
      // Always release the connection back to the pool
      connection.release();

      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log("products: ", res);
      result(null, res);
    });
  });
};

// search method
Product.search = (searchTerm, result) => {
  let query = "SELECT * FROM product WHERE name LIKE ?";
  let formattedSearchTerm = `%${searchTerm}%`;

  sql.getConnection((err, connection) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    connection.query(query, [formattedSearchTerm], (err, res) => {
      connection.release();

      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("products: ", res);
      result(null, res);
    });
  });
};

module.exports = Product;
