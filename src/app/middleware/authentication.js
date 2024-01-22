const bcrypt = require('bcrypt');

const query = "SELECT * FROM users";
const users = await new Promise((resolve, reject) => {
    sql.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

async function authenticateUser(req, res, next) {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).send('Password is incorrect');
    }

    req.user = user; 
    next(); 
}

module.exports = authenticateUser;
