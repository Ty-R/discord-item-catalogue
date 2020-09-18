# Discord Catalogue Bot

Catalogue is a Discord bot that allows the creation of sellers and listings. A seller might be, for example, a shop, and listings would be what that shop sells. Those selling can create sellers and listings, and those buying can search against these to find what they're looking for.

# Setup

1. Clone or download this repository
2. In the newly created directory, run: `npm install`
3. Rename `config.json.example` to `config.json` and modify as needed
4. Rename `help.json.example` to `help.json` and modify as needed
5. Run migations: `npm migrate`
5. Invite the bot to a server

From here, running: `npm start` in the bot directory will start the bot.

# Usage

All commands are run in Discord, and the prefix (`!cat`) may vary depending on the configuration of the bot.

* [Sellers](#sellers)
  * [Add a seller](#adding-a-new-seller)
  * [List sellers](#listing-sellers)
  * [Update a seller](#modifying-a-seller)
  * [Clear seller field](#clear-seller-field)
  * [Seller profile](#seller-profile)
  * [Seller inventory](#seller-inventory)
  * [Default seller](#default-seller)
  * [Remove a seller](#removing-a-seller)
  * [Toggle seller visibility](#toggle-seller-visibility)
* [Listings](#listings)
  * [Add a listing](#adding-a-listing)
  * [Search listings](#searching-listings)
  * [Update listings](#modfying-a-listing)
  * [Move listings](#move-a-listing)
  * [Remove listings](#removing-a-listing)
* [Admin](#admin)
  * [Toggle admins](#adding-or-removing-admins)
  * [Purge user](#purging-a-user)

## Sellers

A seller is needed to add listings. There is no limit to how many sellers a user can have, or how many listings a seller can have. Several seller commands require the ID of a seller. This can be obtained from `!cat seller list` or `!cat seller info [:name]`.

### Adding a new seller

All that's needed to add a seller is a name.

**Usage:** `!cat seller add [:name]`\
**Example:** `!cat seller add My Shop`

### Listing sellers

Lists all sellers in the catalogue.

**Usage:** `!cat seller list`

### Modifying a seller

The only thing needed to create a seller was a name but there are a few other optional fields that can be updated to provide more information. The fields that can be modified are:

* name
* location
* description
* icon

**Usage:** `!cat seller update [:id] [:field]: [:value]`\
**Example:** `!cat seller update 123 description: A description of my shop`

Some things to note:

* Icon should be a URL
* Discord character limits apply (e.g. max of 1024 characters in the description)

### Clear seller field

Used to clear fields in a seller profile. 

**Usage:** `!cat seller clear [:id] [:field]`\
**Example:** `!cat seller clear 123 description`

### Seller profile

Seller profile cotains information about the seller - the ID, owner, whether they're active, the location, and description.

**Usage:** `!cat seller info [:name]`\
**Example:** `!cat seller info My Shop`

### Seller inventory

Allows users to query for all listings under a seller.

**Usage:** `!cat seller inventory [:name]`\
**Example:** `!cat seller inventory My Shop`

### Default seller

When a listing is added (more on this in the listings section), a seller needs to be specified. A user can set one of their sellers as a default so that they do not need to specify a seller each time.

**Usage:** `!cat seller default [:id]`\
**Example:** `!cat seller default 123`\
**Example 2:** `!cat seller default`

Something to note:

* You can find out your current default seller by running the command without giving it an ID

### Removing a seller

If a user no longer wishes to have a seller in the catalogue they can remove it.

**Usage:** `!cat seller remove [:id]`\
**Example:** `!cat seller remove 123`

Some things to note:

* Only one seller can be removed at a time
* Removing a seller set as default will unset it

### Toggle seller visibility

If a user is temporarily inactive then we can toggle the visibility of their listings.

**Usage:** `!cat seller toggle [:id]`\
**Example:** `!cat seller toggle 123`

Some things to note:

* This will mark them as inactive in their seller profile
* Listings owned by inactive sellers will not be returned when searched
* Inactive sellers can still be queried directly using seller commands

## Listings

A listing is an item or service for a price. They belong to sellers and can be searched for by users. Several listing commands require the ID of a listing. This can be obtained from `!cat listing search [:term]` or `!cat seller inventory [:name]`.

### Adding a listing

To add a listing, a user needs to specify what is being sold, how much for, and where:

**Usage:** `!cat listing add [:item]: [:price] > [:seller id]`\
**Example:** `!cat listing add 5 books: 1 gold > My Shop`

Some things to note:

* If a user has set a default seller then they can omit the `> [:seller id]`
* Default seller can be overridden per listing by passing a different seller using `> [:seller id]`

### Searching listings

A user can search for listings by name:

**Usage:** `!cat listing search [:term]`\
**Example:** `!cat listing search books`

Some things to note:

* Search is partial; "book" would return listings with "book" anywhere in the name
* Search is capped at 10 by default but can be changed in the config

### Modfying a listing

Modify the name or price of a listing:

**Usage:** `!cat listing update [:id] [:field]: [:value]`\
**Example:** `!cat listing update 123 item: 10 books`\

Something to note:

* Many listings can be updated at once by passing more (comma-separated) IDs

### Moving a listing

Move listings from one seller to another:

**Usage:** `!cat listing move [:id] > [:seller id]`\
**Example:** `!cat listing move 123 > 456`

* Many listings can be moved at once by passing more (comma-separated) IDs

**Example:** `!cat listing move 1, 2, 3 > 1`

### Removing a listing

**Usage:** `!cat listing remove [:id]`\
**Example:** `!cat listing remove 123`

Something to note:

* Many listings can be removed at once by passing more (comma-separated) IDs

**Example:** `!cat listing remove 1, 2, 3`

## Admin

**Note:** Adding the first admin is slightly different from adding subsequent admins. This can be done by adding your Discord ID to the config and running: `!cat user makemeadmin`. This technique may change in the future.

A catalogue admin can modify or remove the sellers and listings of other users. Most admin commands around users require the user's Discord ID. This can be obtained by: `!cat user list`.

Admins will skip the ownership check when modifying or removing listings or sellers.

### Adding or Removing admins

Toggles the admin status of a user.

**Usage:** `!cat admin toggle [:discord id]`

### Purging a user

If a user is no longer active then they, and all their listings, can be removed from the catalogue:

**Usage:** `!cat admin purge [:discord id]`

# Testing

Tests go under the `test/` directory and can be run with `npm test`.
