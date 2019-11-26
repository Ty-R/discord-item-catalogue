exports.run = (catalogue, args) => {
  const logger = require('winston');
  const queryFromFlag = require('../cat_modules/query_from_flag');

  let query;

  if (args.action == 'update') {
    args.flag = 'i';
  } else if (args.primary.startsWith('@')) {
    args.primary = args.primary.substring(1);
    args.flag = 'l';
  }

  query = queryFromFlag.run(args.flag);

  logger.info(`Searching catalogue for: "${args.primary}" by: "${query}"`);

  try {
    const listings = catalogue.listings.filter(listing => listing[query]);
    return listings.filter(listing => listing[query].toLowerCase().includes(args.primary.toLowerCase()));
  } catch(error) {
    logger.error(`Search for '${query}' failed: ${error}.`);
    return [];
  }
}
