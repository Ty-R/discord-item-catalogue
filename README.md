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

* `-i` - searches by item
* `-u` - searches by user
* `-l` - searches by location

Some examples:

`!cat search book`

`!cat search -u bob`

`!cat search -l spawn`

### Updating a listing

Updating works similarly to searching in that the flag you pass determines which field is updated. For example if I wanted to update the item name from book to diamond, I would pass the `-i` flag, for example:

`!cat update -i book:diamond`

### Removing a listing

The simplest way to remove a listing, is:

`!cat remove [item]`