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

A catalogue search will look through various fields. Firstly it'll look for listings by name, then it'll look for listings by location, and finally, by user. Results will be returned in this order. The given term does not need to be exact:

![](example_images/listing_search.png)

#### Updating a listing

Each listing has an ID which is used to update it. The colon-separated key/value is the field to update and the value to update it to. Currently, the fields that can be changed are:

* item
* price
* location

![](example_images/listing_update.png)

Multiple listings can be updated by passing more comma-separated IDs (`!cat listing update 1, 2, 3 [field]:[value]`)

#### Removing a listing

Each listing has an ID which is used to remove it from the catalogue:

![](example_images/listing_remove.png)

Multiple listings can be removed by passing more comma-separated IDs (`!cat listing remove 1, 2, 3`)

## Admin

Firstly, the help command:

![](example_images/admin_help.png)

#### Adding/Removing admins

![](example_images/admin_add_remove.png)

#### Removing listings

Listing removal is identical to the standard [removal command](#removing-a-listing) except an admin would bypass the ownership check.

#### Purging a user

If a user is no longer active then they, and all their listings, can be removed from the catalogue:

![](example_images/admin_purge.png)