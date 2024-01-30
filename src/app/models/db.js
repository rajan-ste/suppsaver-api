const mysql = require('mysql');
const dbUrl = process.env.CLEARDB_DATABASE_URL;

// Parse the database URL
const dbParts = dbUrl.match(/mysql:\/\/(.*):(.*)@(.*):(.*)\/(.*)\?/);

const connection = mysql.createConnection({
  host: "us-cluster-east-01.k8s.cleardb.net",
  user: "b27037be334874",
  password: "1cfb8b43",
  database: "heroku_6d10f5d88d3405d"
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;
