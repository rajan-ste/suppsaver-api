const sql = require("./db.js");
const bcrypt = require("bcrypt");

// Constructor
const User = function(user) {
    this.email = user.email;
    this.password = user.password; 
};

// Method to create a new user
User.create = async (newUser, result) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(newUser.password, 12);
        const query = "INSERT INTO users (email, password) VALUES (?, ?)";

        sql.query(query, [newUser.email, hashedPassword], (err, res) => {
            if (err) {
                result(err, null);
                return;
            }

            console.log("Created user: ", { id: res.insertId, ...newUser });
            result(null, { id: res.insertId, email: newUser.email });
        });
    } catch (error) {
        result(error, null);
    }
};

module.exports = User;
