const mysql = require('mysql');
require('dotenv').config();

// Create a connection pool with database details
const pool = mysql.createPool({
  connectionLimit: 10, 
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
