const sql = require("./db.js");

// Constructor
const Watchlist = function(watchlist) {
    this.userId = watchlist.userId;
    this.productId = watchlist.productId;
};

// Method to create a new watchlist entry
Watchlist.create = (newEntry, result) => {
    const query = "INSERT INTO watchlist (userid, productid) VALUES (?, ?)";

    sql.query(query, [newEntry.userId, newEntry.productId], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        console.log("Created watchlist entry: ", { id: res.insertId, ...newEntry });
        result(null, { id: res.insertId, userId: newEntry.userId, productId: newEntry.productId });
    });
};

// Method to get watchlist by user ID
Watchlist.findByUserId = (userId, result) => {
    sql.query("SELECT * FROM watchlist WHERE userid = ?", userId, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("Found watchlist: ", res);
            result(null, res);
            return;
        }

        // Not found Watchlist with the user ID
        result({ kind: "not_found" }, null);
    });
};

module.exports = Watchlist;
