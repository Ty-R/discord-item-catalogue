module.exports = {
  name: 'search',
  description: 'test',
  execute(message, catalogue, args) {
    const pluralize = require('pluralize');
    const catalogueSearch = require('./../cat_modules/search_catalogue');

    function resultMessage(result) {
      let message = `• **${result.seller}** is selling **${result.item}** for **${result.price}**`;
      if (result.location) message = message + ` at **${result.location}**`;
      return message;
    }

    function botSearchResults(results) {
      return {
        resultCount: results.length,
        results: results.map(result => resultMessage(result)).join("\n"),
      };
    }

    const { resultCount, results } = botSearchResults(catalogueSearch.run(catalogue, args));
    const response = `That query returned ${pluralize('result', resultCount, true)} \n\n${results}`
  
    message.author.send(response);
  },

  valid(args) {
    return true;
  }
}