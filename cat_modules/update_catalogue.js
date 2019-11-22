exports.run = (catalogue) => {
  const logger = require('winston');
  const fs = require('fs');
  const { catalogueFile } = require('../config.json');

  logger.info('Updating local catalogue.');

  fs.writeFile(catalogueFile, JSON.stringify(catalogue), (err) => {
    if (err) {
      logger.error(err);
      return;
    };
    logger.info("Catalogue updated.");
  });
}
