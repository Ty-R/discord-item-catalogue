exports.run = (catalogue) => {
  const fs = require('fs');
  const { catalogueFile } = require('../config.json');

  console.log('Updating local catalogue.');

  fs.writeFile(catalogueFile, JSON.stringify(catalogue), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("Catalogue updated.");
  });
}