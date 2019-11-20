module.exports = {
  name: 'add',
  usage: '!cat add [item]:[price]',
  execute(message, catalogue, args) {
    console.log('Attempting to add an item to the catalogue.');
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const catalogueUpdate = require('./../cat_modules/update_catalogue');

    function createNewCatalogueEntry(user, args) {
      const newListing = {
        seller: user,
        item: args.primary,
        price: args.secondary,
        location: args.optional
      };
    
      Object.keys(newListing).forEach((key) => (newListing[key] == null) && delete newListing[key]);
    
      catalogue.listings.push(newListing);
      catalogueUpdate.run(catalogue);
    }

    const user = message.author.username;
    const existing = catalogueSearch.run(catalogue, args).find(e => e.seller === user);
    let response;

    if (existing) {
      response = `You already have a **${args.primary}** listing.`;
    } else {
      createNewCatalogueEntry(user, args);
      response = `I've added **${args.primary}** to the catalogue for you`;
    }
  
    message.author.send(response);
  },

  valid(args) {
    return !!args.primary && !!args.secondary;
  }
}
