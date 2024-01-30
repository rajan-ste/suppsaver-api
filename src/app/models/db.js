const mysql = require('mysql');

// Create a connection pool with database details
const pool = mysql.createPool({
  connectionLimit: 10, 
  host: "d6rii63wp64rsfb5.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "rdile1n7zl6vbisb",
  password: "zbbls6n90bj08gaq",
  database: "s7x04anwj94bjqpf"
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
