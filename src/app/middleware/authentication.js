const bcrypt = require('bcrypt');
const sql = require("../models/db.js");
const jwt = require('jsonwebtoken');
require('dotenv').config();


async function authenticateUser(req, res, next) {
    const query = "SELECT * FROM users";

    sql.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send('Error connecting to the database');
        }

        connection.query(query, async (err, users) => {
            connection.release();

            if (err) {
                return res.status(500).send('Error querying the database');
            }

            const { email, password } = req.body;
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
        });
    });
}

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('No token provided');
    }

    jwt.verify(token, process.env.JWT_KEY, function(err, user) {
        if (err) return res.status(403).send('Invalid token');
        req.userId = user.userId; 
        next();
    });
}

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).send('Access to API Denied');
    }
    next();
};

module.exports = {
    authenticateUser,
    authenticateToken,
    authenticateApiKey
};

