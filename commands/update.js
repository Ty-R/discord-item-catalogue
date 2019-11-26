module.exports = {
  name: 'update',
  usage: '!cat update [option] [item]:[term]',
  execute(message, catalogue, args) {
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const catalogueUpdate = require('./../cat_modules/update_catalogue');
    const queryFromFlag = require('../cat_modules/query_from_flag');

    function updateCatalogueItem(listing, args) {
      const query = queryFromFlag.run(args.flag);
      listing[query] = args.secondary;
      catalogueUpdate.run(catalogue);
    }

    const user = message.author.username;
    const listing = catalogueSearch.run(catalogue, args).find(e => e.seller === user && e.item === args.primary);
    let response;

    if (['u', 's'].includes(args.flag)) {
      response = 'You cannot update the name of the seller!';
    } else if (listing) {
      updateCatalogueItem(listing, args);
      response = `I've updated that listing for you.`;
    } else {
      response = `I couldn't find a listing for **${args.primary}** that belongs to you.`;
    }

    message.channel.send(`Hi, ${user}! ${response}`);
  },

  valid(args) {
    return !!args.flag && !!args.primary && !!args.secondary;
  }
}
