const sql = require("./db.js");

// Constructor
const Watchlist = function(watchlist) {
    this.userId = watchlist.userId;
    this.productId = watchlist.productId;
};

/**
 * Creates a new entry in the watchlist for a user.
 * @param {Object} newEntry An object containing the new watchlist entry details, including userId and productId.
 * @param {(error: Error, result: Object) => void} result Callback function to handle the operation's result.
 */
Watchlist.create = (newEntry, result) => {
    const query = "INSERT INTO watchlist (userid, productid) VALUES (?, ?)";

    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        connection.query(query, [newEntry.userId, newEntry.productId], (err, res) => {
            connection.release();

            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            console.log("Created watchlist entry: ", { id: res.insertId, ...newEntry });
            result(null, { id: res.insertId, userId: newEntry.userId, productId: newEntry.productId });
        });
    });
};

/**
 * Retrieves all watchlist entries for a given user by their user ID.
 * @param {number} userId The ID of the user whose watchlist entries are to be retrieved.
 * @param {(error: Error, result: Object[]) => void} result Callback function to handle the operation's result.
 */
Watchlist.findByUserId = (userId, result) => {
    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        connection.query("SELECT * FROM watchlist WHERE userid = ?", userId, (err, res) => {
            connection.release();

            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.length) {
                console.log("Found watchlist: ", res);
                result(null, res);
                return;
            }

            result({ kind: "not_found" }, null);
        });
    });
};

/**
 * Deletes a specific watchlist entry based on a user ID and product ID.
 * @param {Object} entryToDelete An object containing the userId and productId of the watchlist entry to be deleted.
 * @param {(error: Error, result: Object) => void} result Callback function to handle the operation's result.
 */
Watchlist.delete = (entryToDelete, result) => {
    const query = "DELETE FROM watchlist WHERE userid = ? AND productid = ?";

    sql.getConnection((err, connection) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        connection.query(query, [entryToDelete.userId, entryToDelete.productId], (err, res) => {
            connection.release();

            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            console.log("Deleted watchlist entry: ", { id: res.insertId, ...entryToDelete });
            result(null, { id: res.insertId, userId: entryToDelete.userId, productId: entryToDelete.productId });
        });
    });
};

module.exports = Watchlist;
