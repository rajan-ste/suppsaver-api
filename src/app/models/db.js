const mysql = require('mysql');

// Create a connection pool with database details
const pool = mysql.createPool({
  connectionLimit: 10, 
  host: "us-cluster-east-01.k8s.cleardb.net",
  user: "b9647831c9c227",
  password: "e084edce",
  database: "heroku_5c7a1dc315362c5"
});

// Function to get a connection from the pool
function getConnection(callback) {
  pool.getConnection((err, connection) => {
    if(err) {
      return callback(err);
    }
    callback(null, connection);
  });
}

module.exports = { getConnection };
