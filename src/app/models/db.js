const mysql = require('mysql');
const dbUrl = process.env.CLEARDB_DATABASE_URL;

// Parse the database URL
const dbParts = dbUrl.match(/mysql:\/\/(.*):(.*)@(.*):(.*)\/(.*)\?/);

const connection = mysql.createConnection({
  host: "us-cluster-east-01.k8s.cleardb.net",
  user: "b9647831c9c227",
  password: "e084edce",
  database: "heroku_5c7a1dc315362c5"
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;
