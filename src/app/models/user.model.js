const sql = require("./db.js");
const bcrypt = require("bcrypt");

// Constructor
const User = function(user) {
    this.email = user.email;
    this.password = user.password; 
};

/**
 * Creates a new user in the database with a hashed password.
 * @param {Object} newUser An object containing the new user's details. Must include 'email' and 'password'.
 * @param {(error: Error, result: Object) => void} result Callback function to handle the result of the user creation operation.
 *        If successful, returns the new user's ID and email. If an error occurs, returns an error object.
 */
User.create = async (newUser, result) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(newUser.password, 12);

        sql.getConnection((err, connection) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            const query = "INSERT INTO users (email, password) VALUES (?, ?)";
            connection.query(query, [newUser.email, hashedPassword], (err, res) => {
                // Release the connection back to the pool
                connection.release();

                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }

                console.log("Created user: ", { id: res.insertId, ...newUser });
                result(null, { id: res.insertId, email: newUser.email });
            });
        });
    } catch (error) {
        console.log("error: ", error);
        result(error, null);
    }
};

module.exports = User;
