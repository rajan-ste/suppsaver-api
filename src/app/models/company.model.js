const sql = require("./db.js");

// constructor
const Company = function(company) {
  this.id = company.id;
  this.name = company.name;
  this.homepage = company.homepage;
};

Company.findById = (id, result) => {
  sql.getConnection((err, connection) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    connection.query("SELECT * FROM company WHERE id = ?", [id], (err, res) => {
      connection.release();

      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        console.log("found company: ", res[0]);
        result(null, res[0]);
        return;
      }

      result({ kind: "not_found" }, null);
    });
  });
};

Company.getAll = (result) => {
  sql.getConnection((err, connection) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    connection.query("SELECT * FROM company", (err, res) => {
      connection.release();

      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("companies: ", res);
      result(null, res);
    });
  });
};

Company.updateById = (id, company, result) => {
  sql.getConnection((err, connection) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    connection.query(
      "UPDATE company SET name = ?, homepage = ? WHERE id = ?",
      [company.name, company.homepage, id],
      (err, res) => {
        connection.release();

        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("updated company: ", { id: id, ...company });
        result(null, { id: id, ...company });
      }
    );
  });
};

module.exports = Company;
