const db = require('../db/config');
const pluralise = require('pluralise');
const { searchCap } = require('../config.json');

module.exports = {
  name: 'listing',
  description: "A listing is an item or service for a price. Listings belong to sellers",
  subCommands: {
    add: {
      usage: 'listing add [item]:[price] > [seller id]',
      description: 'Add a new listing',
      argsPattern: /(?<item>[^:]+[^\s])\s*:\s*(?<price>.+?)\s*(?=>\s*(?<sellerName>.+)|$)/,
      execute(args, user) {
        const id = args.sellerName || user.defaultSeller;
        if (!id) return Promise.resolve({
          message: "I don't know where to add that listing - no seller specified and no default seller set."
        });

        return db('sellers')
          .where({
            userId: user.id,
            id: id
          }).first().then(seller => {
            if (!seller) return {
              message: 'I was unable to find your seller with that ID.'
            }

            return db('listings')
              .insert({
                item: args.item,
                price: args.price,
                userId: user.id,
                sellerId: seller.id
              }).then(() => {
                return {
                  success: true,
                  message: `I've added that listing to "${seller.name}" for you.`
                }
              }).catch(error => Promise.reject(error));
          }).catch(error => Promise.reject(error));
      }
    },

    remove: {
      usage: 'listing remove [id]',
      description: 'Remove an existing listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)/,
      execute(args, user) {
        return db('listings')
          .whereIn('id', args.listingIds.split(','))
          .where(function() {
            if (!user.admin) this.where('userId', user.id);
          }).del().then(results => {
            if (results) {
              return {
                success: true,
                message: `I've removed ${pluralise.withCount(results, '% listing')} for you.`
              }
            } else {
              return {
                message: 'I was unable to find any of your listing with the IDs given.'
              }
            }
          });
      }
    },

    search: {
      usage: 'listing search [term]',
      description: 'Search for a listing by item or seller',
      argsPattern: /(?<term>.+)/,
      execute(args) {
        return db('listings')
          .join('sellers', { 'sellers.id': 'listings.sellerId' })
          .where({ active: 1 })
          .whereRaw(`LOWER("item") LIKE LOWER("%${args.term}%")`)
          .limit(searchCap).then(results => {
            if (results.length) {
              return {
                success: true,
                message: "Here's what I found:\n\n" + results.map(result => `• [${result.id}]  **${result.name}** is selling **${result.item}** for **${result.price}**`).join("\n")
              };
            } else {
              return {
                message: `I was unable to find any listing names containing "${args.term}"`
              };   
            }
          }).catch(error => Promise.reject(error));
      }
    },

    update: {
      usage: 'listing update [id] [field]:[value]',
      description: 'Update the item or price of a listing',
      argsPattern: /(?<listingIds>[0-9,\s]+)\s(?<field>item|price)\s*:\s*(?<value>.+)/,
      execute(args, user) {
        return db('listings')
          .whereIn('id', args.listingIds.split(','))
          .where(function() {
            if (!user.admin) this.where('userId', user.id);
          }).update(args.field, args.value).then(results => {
            if (results) {
              return {
                success: true,
                message: `I've updated the "${args.field}" of ${pluralise.withCount(results, '% listings')} for you.`
              }
            } else {
              return {
                message: 'I was unable to find your listings with the IDs given.'
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    move: {
      usage: 'listing move [id] > [seller id]',
      description: 'Move a listing to a different seller',
      argsPattern: /(?<listingIds>[0-9,\s]+)\s*>\s*(?<sellerId>.+)/,
      execute(args, user) {
        return db('sellers')
          .where({ id: args.sellerId })
          .where(function() {
            if (!user.admin) this.where('userId', user.id);
          }).first().then(seller => {
            if (!seller) return {
              message: 'I was unable to find your seller with that ID.'
            }

            return db('listings')
              .whereIn('id', args.listingIds.split(','))
              .where(function() {
                if (!user.admin) this.where('userId', user.id);
              }).update({ sellerId: seller.id }).then(results => {
                if (results) {
                  return {
                    success: true,
                    message: `I've moved ${pluralise.withCount(results, '% listings')} to "${seller.name}"`
                  }
                } else {
                  return {
                    message: 'I was unable to find your listings with the IDs given.'
                  }
                }
              }).catch(error => Promise.reject(error));
            }).catch(error => Promise.reject(error));
      }
    },

    help: {
      usage: 'listing help',
      description: 'Shows this',
      execute() {
        return Promise.resolve({
          success: true,
          type: 'help',
          message: module.exports.subCommands
        });
      }
    }
  }
}
