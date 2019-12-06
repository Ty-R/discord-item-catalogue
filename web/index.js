const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = require('../cat_modules/db');

const { helpIcon } = require('../config.json');
const catalogueSearch = require('../cat_modules/search_catalogue');

const app = express();
db.connect('../db/catalogue.db');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.listen(3000, () => console.log("Server started."));

app.get("/", (req, res) => {
  const sql = "SELECT * FROM listings ORDER BY item"
  const listings = catalogueSearch.run(sql);
  listings.then((rows) => {
    res.render("index", { model: rows, icon: helpIcon });
  }).catch((err) => console.error(err))
});
