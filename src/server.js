const express = require("express");
const cors = require("cors");


const app = express();

allowedOrigins = ['http://suppsaver.net', 'http://www.suppsaver.net', 'https://suppsaver.net', 'http://www.suppsaver.net', 'http://localhost:5173']

var corsOptions = {
  origin: allowedOrigins
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

// set port, listen for requests
const PORT = process.env.PORT || 8080;

require("./app/routes/product.routes.js")(app);
require("./app/routes/company.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/watchlist.routes.js")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});