const express = require("express");
const path = require("path");
const sqlite = require('../cat_modules/db');
const bodyParser = require('body-parser');

const { helpIcon } = require('../config.json');
const catalogueSearch = require('../cat_modules/search_catalogue');

const app = express();
sqlite.connect('../db/catalogue.db');
const db = sqlite.load();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, () => console.log("Server started."));

app.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const sql = `SELECT rowid, * FROM listings
               WHERE "${knownActions.find(a => a === req.query.flag) || 'item'}"
               LIKE "%${toSafeString(req.query.q)}%"
               ORDER BY rowid DESC
               LIMIT 10
               OFFSET ${page * 10}`

  const searchListings = catalogueSearch.run(sql);
  searchListings.then((listings) => {
    const prev = page !== 0;
    const next = listings.length === 10;
    res.render("listings", { listings, helpIcon, page, next, prev });
  }).catch((err) => console.error(err))
});

app.get("/add", (req, res) => {
  res.render("add", { helpIcon });
});

app.post("/add-listing", (req, res) => {
  const { user, primary, secondary, optional } = req.body;
  const sql = `INSERT INTO listings (seller, item, price, location)
               VALUES ("${toSafeString(user)}",
                       "${toSafeString(primary)}",
                       "${toSafeString(secondary)}",
                       "${toSafeString(optional)}")`
  db.run(sql, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).send("You're already selling that!");
      } else {
        return res.status(400).send('Something went wrong.');
      }
    }
    return res.status(200).send('Added');
  });
});

function toSafeString(str) {
  return str ? str.replace(/[^ \w-@()\[\]_#,\.']+/g, '').trim() : '';
}

const knownActions = ['item', 'seller', 'location'];
