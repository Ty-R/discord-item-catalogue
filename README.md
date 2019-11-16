# Discord Catalogue Bot

Catalogue is a bot designed to make it easier to keep track of who is selling what. It allows sellers to add listings, and buyers to query them.

### Adding a new listing

The simplest way to add a listing, is:

`!cat add [item]:[price]`

Specifying a location is also supported by following the above with `@[location]`, a full example might be:

`!cat add book:5 gold @spawn`

### Searching for listings

The simplest way to search for a listing, is:

`!cat search [item]`

It's possible to change the focus of the search using flags:

* `-i` - searches by item (default)
* `-u` - searches by user
* `-p` - searches by price
* `-l` - searches by location

Some examples:

`!cat search book`

`!cat search -u bob`

`!cat search -l spawn`

### Updating a listing

Updating a listing takes 3 parts:

1. The flag - used to specify which part of the isting to update (item name, price, location etc.)
2. The item - the existing name of the item; used to find the listing to update
3. The new value - this value will be applied to the field specified using the flag

The flags in this case are similar to the ones used in searching:

* `-i` - updates the name of the item
* `-p` - updated the price of the item
* `-l` - updates the location of the item

Let's say you have an existing listing where you're selling 32 books for 10 gold at spawn, to update these fields:

* Updating the item: `!cat update -i 32 books:64 books`
* Updating the price: `!cat update -p 64 books:20 gold`
* Updating the loction: `!cat search -l 64 books:plot 5`

### Removing a listing

The simplest way to remove a listing, is:

`!cat remove [item]`
