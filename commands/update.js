module.exports = {
  name: 'update',
  usage: '!cat update <flag> [item]:[term]',
  execute(message, catalogue, args) {
    const catalogueSearch = require('./../cat_modules/search_catalogue');
    const catalogueUpdate = require('./../cat_modules/update_catalogue');

    function queryFromFlag(flag) {
      switch(flag) {
        case 'i':
          return 'item';
        case 'l':
          return 'location';
        case 'p':
          return 'price';
      }
    
      return 'item';
    }

    function updateCatalogueItem(listing, args) {
      const query = queryFromFlag(args.flag);
      listing[query] = args.secondary;
      catalogueUpdate.run(catalogue);
    }

    const user = message.author.username;
    const listing = catalogueSearch.run(catalogue, args).find(e => e.seller === user);
    let response;

    if (['u', 's'].includes(args.flag)) {
      response = 'You cannot update the name of the seller!';
    } else if (listing) {
      updateCatalogueItem(listing, args);
      response = `I've updated your **${args.primary}** listing`;
    } else {
      response = `I couldn't find a listing for **${args.primary}** that belongs to you.`;
    }

    message.author.send(response);
  },

  valid(args) {
    return !!args.flag && !!args.primary && !!args.secondary;
  }
}
