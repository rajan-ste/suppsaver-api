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

      for (let dbProduct of dbProducts) {
          let score = stringSimilarity.compareTwoStrings(newProduct.productname, dbProduct.name);
          if (score > highestMatch.score) {
              highestMatch = { id: dbProduct.id, score };
          }
      }

      return { ...newProduct, matchId: highestMatch.id, matchScore: highestMatch.score };
  });
};

// Method to create new products and insert them into product_company
Product.create = async (newProducts, result) => {
  try {
      // Ensure newProducts is always an array
      if (!Array.isArray(newProducts)) {
          newProducts = [newProducts];
      }

      const matchedProducts = await Product.findMostSimilar(newProducts);

      for (let product of matchedProducts) {
          let productId;

          if (product.matchScore > 0.6) {
              productId = product.matchId;
          } else {
              // Insert new product into the product table
              const insertProductQuery = "INSERT INTO product (name) VALUES (?)";
              const productInsertion = await new Promise((resolve, reject) => {
                  sql.query(insertProductQuery, [product.productname], (err, res) => {
                      if (err) reject(err);
                      else resolve(res.insertId);
                  });
              });
              productId = productInsertion;
          }

          // Insert or update in product_company table
          const insertProductCompanyQuery = "INSERT INTO product_company (productid, companyid, price, image, link) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = ?, image = ?, link = ?";
          await new Promise((resolve, reject) => {
              sql.query(insertProductCompanyQuery, [productId, product.companyid, product.price, product.image, product.link, product.price, product.image, product.link], (err, res) => {
                  if (err) reject(err);
                  else resolve(res);
              });
          });

          console.log("Inserted/Updated Product:", { productid: productId, ...product });
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

module.exports = Product;