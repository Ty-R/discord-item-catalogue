# Discord Catalogue Bot

# Setup

1. Clone or download this repository
2. In the newly created directory, run: `npm install`
3. Rename `config.json.example` to `config.json` and fill in the fields within it:
    * Prefix is the command that will trigger the bot
    * Token is the token of the bot generated in the portal
4. Rename `help.json.example` to `help.json` and fill in the fields within it
5. Invite the bot to a server

From here, running: `node cat` in the bot directory will start the bot.

# Usage

Catalogue is a bot designed to make it easier to keep track of who is selling what. It allows sellers to add listings, and buyers to query them.

### Adding a new listing

The simplest way to add a listing, is:

`!cat add [item]:[price]`

Specifying a location is also supported by following the above with `@[location]`, a full example might be:

`!cat add 1 book:5 gold @spawn`

### Searching for listings

The simplest way to search for a listing, is:

`!cat search [item]`

It's possible to change the focus of the search using flags:

* `-i` - searches by item (default if unspecified)
* `-u` - searches by user
* `-p` - searches by price
* `-l` - searches by location

Some examples:

* Searching for all listings containing 'book': `!cat search book`
* Searching for all listings by a user called Bob: `!cat search -u Bob`
* Searching for all listings for items sold at spawn: `!cat search -l spawn`

# Advanced usage

### Detailed search

`v` is an additional flag that can be passed to the search command for a more detailed output. The output is the same but it is prepended with the ID and owner of the listing, for example:

`!cat search -v book`

May result in a listing like:

`* [id: 1, owner: Bob] Bob's shop is selling 5 books for 1 gold`

This flag can be stacked with the focus flags, for example:

* Detailed item search `!cat search -v book`
* Detailed user search`!cat search -vu Bob`
* Detailed location search: `!cat search -vl spawn`

### Updating a listing

Updating a listing takes 3 parts:

1. The flag - used to specify which part of the listing to update (item name, price, location etc.)
2. The listing ID - obtainable through the detailed search
3. The new value - this value will be applied to the field specified using the flag

The flags in this case are similar to the ones used in searching:

* `-i` - updates the name of the item
* `-p` - updates the price of the item
* `-l` - updates the location of the item

Let's say you have a listing where you're selling 32 books for 10 gold at spawn, and the ID of that listing is 10. You'd update each field by for example:

* Updating the item: `!cat update -i 10 : 64 books`
* Updating the price: `!cat update -p 10 : 20 gold`
* Updating the loction: `!cat update -l 10 : plot 5`

### Removing listings

The simplest way to remove a listing, is:

`!cat remove [listing ID]`

Multiple listings can be removed by adding more IDs:

`!cat remove [comma-separated listing IDs]`

# Admin

An admin user can delete listings owned by another user, and remove users from the catalogue entirely.

### Adding admins

Only admins can add other admins:

`!cat admin [add|remove] : [Discord ID]`

### Listing users

Returns some information about all users the catalogue currently has:

`!cat users`

### Deleting listings owned by another user

An admin can delete other users' listings by:

`!cat delete [listing id]`

Multiple listings can be removed by adding more IDs:

`!cat delete [comma-separated listing IDs]`

### Removing a user from the catalogue

If a user is no longer active then they, and all their listings, can be removed fom the catalogue:

`!cat purge [Discord ID]`

