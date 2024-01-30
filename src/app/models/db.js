const mysql = require('mysql');
const dbUrl = process.env.CLEARDB_DATABASE_URL;

// Parse the database URL
const dbParts = dbUrl.match(/mysql:\/\/(.*):(.*)@(.*):(.*)\/(.*)\?/);

const connection = mysql.createConnection({
  host: dbParts[3],
  user: dbParts[1],
  password: dbParts[2],
  database: dbParts[5]
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;
