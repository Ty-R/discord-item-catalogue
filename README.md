# Discord Catalogue Bot

Catalogue is a Discord bot for keeping track of items or services being sold by users. Sellers can add 'listings' to the catalogue for what they're selling, how much for, and where, while buyers can search through these listings to find out if what they're looking for is being sold.

One example of how this could be used is for an in-game market/shop system with Discord server advertisements - owners of shops can add their inventories to the catalogue so that users can quickly search without having to visit each shop.

# Setup

1. Clone or download this repository
2. In the newly created directory, run: `$ npm install`
3. Rename `config.json.example` to `config.json` and modify as needed
4. Rename `help.json.example` to `help.json` and modify as needed
5. Invite the bot to a server

From here, running: `$ node cat` in the bot directory will start the bot.

# Usage

All commands are run in Discord, and the prefix (`!cat`) may vary depending on the configuration of the bot.

## Listings

Firstly, the help command:

![](example_images/listing_help.png)

#### Adding a new listing

A listing can be added by telling the bot what you want to add and for how much. Optionally a location can be give too:

![](example_images/listing_add.png)

#### Searching for a listing

A listing can be searched for by item. The given term does not need to be exact:

![](example_images/listing_search.png)

#### Updating a listing

Updating a listing takes an ID followed by a colon separated key/value for the field to update, and the value to update it with respectively:

![](example_images/listing_update.png)

#### Removing a listing

Each listing has an ID and this ID is used to remove it from the catalogue:

![](example_images/listing_remove.png)

## Admin

Firstly, the help command:

IMAGE

#### Adding/Removing admins

IMAGE

#### Removing listings

Identical to the standard [removal command](#)

#### Purging a user

If a user is no longer active then they, and all their listings, can be removed from the catalogue:

IMAGE
