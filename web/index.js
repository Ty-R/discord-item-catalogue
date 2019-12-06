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
app.use(express.static(__dirname + '/public'));

app.listen(3000, () => console.log("Server started."));

app.get("/", (req, res) => {
  const sql = "SELECT rowid, * FROM listings ORDER BY rowid DESC LIMIT 10"
  const searchListings = catalogueSearch.run(sql);
  searchListings.then((listings) => {
    res.render("index", { listings, helpIcon });
  }).catch((err) => console.error(err))
});

app.get("/listings", (req, res) => {
  const sql = `SELECT * FROM listings WHERE "${req.query.flag}" LIKE "%${req.query.q}%"`
  console.log(sql)
  const searchListings = catalogueSearch.run(sql);
  searchListings.then((listings) => {
    res.render("listings", { listings, helpIcon });
  }).catch((err) => console.error(err))
});
