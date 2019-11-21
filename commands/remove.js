module.exports = {
  name: 'remove',
  usage: '!cat remove [item]',
  execute(message, catalogue, args) {
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const catalogueUpdate = require('./../cat_modules/update_catalogue');

    function deleteCatalogueEntry(listing) {
      const index = catalogue.listings.indexOf(listing);
      catalogue.listings.splice(index, 1);
      catalogueUpdate.run(catalogue);
    }

    const user = message.author.username;
    const listing = catalogueSearch.run(catalogue, args).find(e => e.seller === user);
    let response;

    if (listing) {
      deleteCatalogueEntry(listing);
      response = `I've removed your  **${args.primary}** listing`;
    } else {
      response = `I couldn't find a listing for **${args.primary}** that belongs to you.`;
    }

    message.channel.send(`Hi, ${user}! ${response}`);
  },

  valid(args) {
    return !!args.primary;
  }
}