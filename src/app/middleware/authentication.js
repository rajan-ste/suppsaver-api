const bcrypt = require('bcrypt');
const sql = require("../models/db.js");

async function authenticateUser(req, res, next) {
    const query = "SELECT * FROM users";
    const users =  await new Promise((resolve, reject) => {
        sql.query(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const { email, password } = req.body;
    console.log(email)
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).send('Password is incorrect');
    }

    req.user = user; 
    next(); 
}

module.exports = authenticateUser;
