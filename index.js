const express = require("express");
const app = express();

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demo",
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.listen(3000, console.log("Server Started"));

app.get("/", (req, res) => {
  connection.connect((err) => {
    if (err) {
      res.render("DB_Disconnected");
    } else {
      res.render("index");
    }
  });
});

app.post("/shortenLink", (req, res) => {
  const original_url = req.body.url;
  const shortened_url = Math.random().toString(32).substring(2, 10);
  const data = { original_url, shortened_url };
  // console.log(data);

  let query = new Promise(function (resolve, reject) {
    connection.query(
      "INSERT INTO link_shortener SET ?",
      data,
      function (error, sqlResults, fields) {
        resolve({ error, sqlResults, fields });
      }
    );
  });

  query.then((result) => {
    // console.log(result);
    if (result.error) {
      console.log(result.error.sqlMessage);
      res.status(401).json({ error: "Data not saved" });
    } else {
      res
        .status(200)
        .json({ success: "Data saved", insertId: result.sqlResults.insertId });
    }
    res.end();
  });
});

app.get("/get_all_shortLinks", (req, res) => {
  const sql = "SELECT * FROM link_shortener";
  let query = new Promise((resolve, reject) => {
    connection.query(sql, function (error, sqlResults, fields) {
      resolve({ error, sqlResults, fields });
    });
  });

  query.then((results) => {
    res.json(results.sqlResults);
    res.end();
  });
});

app.post("/get_single_shortLink", (req, res) => {
  const sql =
    "SELECT * FROM link_shortener WHERE short_link_id=" + req.body.linkID;
  let query = new Promise((resolve, reject) => {
    connection.query(sql, function (error, sqlResults, fields) {
      resolve({ error, sqlResults, fields });
    });
  });

  query.then((results) => {
    res.json(results.sqlResults[0]);
    res.end();
  });
});

app.post("/edit_shortLink", (req, res) => {
  const sql = "UPDATE link_shortener SET original_url=? WHERE short_link_id=?";
  const placeholders = [req.body.newLink, req.body.linkID];
  let query = new Promise((resolve, reject) => {
    connection.query(sql, placeholders, function (error, sqlResults, fields) {
      resolve({ error, sqlResults, fields });
    });
  });

  query.then((results) => {
    if (results.error) {
      res.send("Link couldn't be edited");
    } else {
      res.json(results.sqlResults);
    }
    res.end();
  });
});

app.post("/delete_shortLink", (req, res) => {
  const sql = "DELETE FROM link_shortener WHERE short_link_id=?";
  const placeholders = [req.body.linkID];
  let query = new Promise((resolve, reject) => {
    connection.query(sql, placeholders, function (error, sqlResults, fields) {
      resolve({ error, sqlResults, fields });
    });
  });

  query.then((results) => {
    if (results.error) {
      res.json("Link couldn't be deleted");
    } else {
      res.json("Link Deleted");
    }
    res.end();
  });
});

app.get("/:shortLink", (req, res) => {
  const shortLink = req.params.shortLink;
  if (shortLink.length > 0) {
    const sql =
      "SELECT original_url, click_count FROM link_shortener WHERE shortened_url=?";
    const placeholders = [shortLink];
    connection.query(sql, placeholders, function (error, sqlResults, fields) {
      // console.log({ error, sqlResults, fields });
      if (error || sqlResults.length < 1) {
        // res.send();
        res.render("404");
        res.end();
      } else {
        const click_count = sqlResults[0].click_count + 1;
        const sql =
          "UPDATE link_shortener SET click_count=? WHERE shortened_url=?";
        const placeholders = [click_count, shortLink];
        connection.query(sql, placeholders);
        res.redirect(sqlResults[0].original_url);
      }
    });
  } else {
    res.render("404");
    res.end();
  }
});
