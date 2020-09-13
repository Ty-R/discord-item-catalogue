const db = require('../db/config');

module.exports = {
  name: 'seller',
  subCommands: {
    list: {
      usage: 'seller list',
      description: 'Lists all sellers',
      execute() {
        return db('sellers').then(sellers => {
          if (sellers.length) {
            return {
              success: true,
              message: "Here you go:\n\n" + sellers.map(seller => `• [${seller.id}] ${seller.name}`).join("\n")
            };
          } else {
            return {
              message: 'There are no sellers in the catalogue yet.'
            };
          };
        }).catch(error => Promise.reject(error));
      }
    },

    add: {
      usage: 'seller add [name]',
      description: 'Adds a new seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args, user) {
        return db('sellers')
          .insert({
            name: args.sellerName,
            userId: user.id
          }).then(result => {
            if (result) {
              return {
                success: true,
                message: "I've added that seller for you."
              }
            } else {
              return {
                // This isn't great, it assumes the only reason
                // this can fail is due to the UNIQUE constraint.
                message: 'A seller by that name already exists.'
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    remove: {
      usage: 'seller remove [id]',
      description: 'Removes a seller and any listings it holds',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        return db('sellers')
          .where({ id: args.sellerId })
          .where(function() {
            if (!user.admin) this.where('userId', user.id);
          }).del().then(result => {
            if (result) {
              return {
                success: true,
                message: "That seller (and its listings) has been removed from the catalogue."
              }
            } else {
              return {
                message: 'I was unable to find your seller with that ID.'
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    update: {
      usage: 'seller update [id] [field]:[value]',
      description: 'Updates the field of a seller - name, location, icon, description',
      argsPattern: /(?<sellerId>[0-9]+)\s(?<field>name|location|icon|description)\s*:\s*(?<value>.+)/i,
      execute(args, user) {
        return db('sellers')
          .where({ id: args.sellerId })
          .where(function() {
            if (!user.admin) this.where('userId', user.id);
          }).update(args.field.toLowerCase(), args.value)
          .then(result => {
            if (result) {
              return {
                success: true,
                message: `I've updated that seller's ${args.field} for you.`
              }
            } else {
              return {
                message: 'I was unable to find your seller with that ID.'
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    clear: {
      usage: 'seller clear [id] [field]',
      description: 'Clears the field of a seller - location, icon, description',
      argsPattern: /(?<sellerId>[0-9]+)\s(?<field>location|icon|description)/i,
      execute(args, user) {
        return db('sellers')
        .where({ id: args.sellerId })
        .where(function() {
          if (!user.admin) this.where('userId', user.id);
        }).update(args.field.toLowerCase(), null)
        .then(result => {
          if (result) {
            return {
              success: true,
              message: `I've cleared that seller's ${args.field} for you.`
            }
          } else {
            return {
              message: 'I was unable to find your seller with that ID.'
            }
          }
        }).catch(error => Promise.reject(error));
      }
    },
  
    inventory: {
      usage: 'seller inventory [name|id]',
      description: 'Lists the inventory of a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return db('listings')
          .select('listings.id', 'listings.item', 'listings.price', 'sellers.name')
          .join('sellers', { 'sellers.id': 'listings.sellerId' })
          .where(function() {
            this.whereRaw(`LOWER("sellers.name") LIKE LOWER("${args.sellerName}%")`)
            .orWhere('sellers.id', args.sellerName)
          }).then(listings => {
            if (listings.length) {
              return {
                success: true,
                message: "Here's what they sell:\n\n" + listings.map(row => `• [${row.id}] ${row.item} for ${row.price}`).join("\n")
              };
            } else {
              return {
                message: "I couldn't find anything. That seller either doesn't exist or isn't currently selling anything."
              };
            };
          }).catch(error => Promise.reject(error));
      }
    },

    info: {
      usage: 'seller info [name|id]',
      description: 'Shows information about a seller',
      argsPattern: /(?<sellerName>.+)/,
      execute(args) {
        return db('sellers')
          .select('sellers.*', 'users.name AS owner')
          .leftJoin('users', { 'users.id': 'sellers.userId' })
          .where(function() {
            this.whereRaw(`LOWER("sellers.name") LIKE LOWER("${args.sellerName}%")`)
            .orWhere('sellers.id', args.sellerName)
          }).first().then(seller => {
            if (!seller) return {
              message: 'I was unable to find that seller.'
            }

            return {
              success: true,
              message: {
                "embed": {
                  "color": `${seller.colour || '3447003'}`,
                  "thumbnail": {
                    "url": `${seller.icon || ''}`
                  },
                  "fields": [
                    {
                      "name": "ID",
                      "value": `${seller.id}`,
                      "inline": true,
                    },
                    {
                      "name": "Name",
                      "value": `${seller.name}`,
                      "inline": true
                    },
                    {
                      "name": "Active",
                      "value": `${seller.active ? 'Yes' : 'No'}`
                    },
                    {
                      "name": "Location",
                      "value": `${seller.location || '--'}`
                    },
                    {
                      "name": "Owner",
                      "value": `${seller.owner}`
                    },
                    {
                      "name": "Description",
                      "value": `${seller.description || '--'}`
                    }
                  ]
                }
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    default: {
      usage: 'seller default [id]',
      description: 'Sets a default seller for new listings',
      argsPattern: /(?<sellerId>[0-9]*)/,
      execute(args, user) {
        if (!args.sellerId) return Promise.resolve({
            success: true,
            message: `Your current default seller is ${user.defaultSeller || 'not set'}`
        });

        return db('sellers')
          .where({ id: args.sellerId, userId: user.id })
          .first().then(seller => {
            if (!seller) return {
              message: 'I was unable to find your seller by that ID.'
            }

            return db('users')
              .where({ id: user.id })
              .update({ defaultSeller: seller.id })
              .then(result => {
                if (result) {
                  return {
                    success: true,
                    message: "I've set that as your default seller."
                  }
                } else {
                  return {
                    message: 'I was unable to find your seller by that ID.'
                  }
                }
              }).catch(error => Promise.reject(error));
            }).catch(error => Promise.reject(error));
      }
    },

    toggle: {
      usage: 'seller toggle [id]',
      description: 'Toggle seller visibility',
      argsPattern: /(?<sellerId>[0-9]+)/,
      execute(args, user) {
        if (user.admin) user.id = user.id;
        return db('sellers')
          .where({ id: args.sellerId })
          .update({
            active: db.raw('NOT active')
          }).then(result => {
            if (result) {
              return {
                success: true,
                message: "I've toggled that seller for you"
              }
            } else {
              return {
                message: 'I was unable to find your seller by that ID.'
              }
            }
          }).catch(error => Promise.reject(error));
      }
    },

    help: {
      usage: 'seller help',
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
