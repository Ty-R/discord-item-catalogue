# Discord Catalogue Bot

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

### Removing a listing

The simplest way to remove a listing, is:

`!cat remove [listing ID]`

## Bulk removal

Sometimes you may want to remove many listings at once. This can be done with a comma-separated list of listing IDs, for example:

`!cat remove 1, 2, 3` would remove listings with IDs of 1, 2, and 3.

### Removal of listings owned by another user

Admins skip the owner check when removing listings. This is so that inappropriate listings, or listings owned by an inactive user, can be removed. The remove command is identical to the existing one but admins may want to use the IDs instead of item names:

`!cat remove [listing id]`

### Purging a user

If an inactive user has many listings then we can purge them from the catalogue. This is an admin-locked command:

`!cat purge [username]`

### Adding admins

A user can be made an admin by adding their Discord user ID to the config.

# Help output

`!cat help` will return a message defined in a file called `help.json`. This file doesn't exist by default so it'll need creating. Refer to the Discord API for information on what should be in this file (embedded message), but a file called `help.json.example` would be a good starting point.
