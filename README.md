# Discord Catalogue Bot

Catalogue is a bot designed to make it easier to keep track of who is selling what. It allows sellers to add listings, and buyers to query them.

### Adding a new listing

The simplest way to add a listing, is:

`!cat add item: [item]`

This command also supports other arguments such as: `quantity:`, `price:`, `location:`. All of these are optional, and any of them can be added. An example of a more detailed catalogue addition:

`!cat add item: book quantity: 5 price: 5 gold location: spawn`

### Searching for listings

The simplest way to search for a listing, is:

`!cat search item: [item]`

This command also supports other arguments such as: `seller:`, `location:`. These arguments, along with `item:` can be used freely to search the catalogue:

`!cat search item: book`

`!cat search item: book seller: John`

`!cat search seller: John`

`!cat search location: spawn`

`!cat search item: book seller: John location: spawn`

Searching is essentially filtering - it starts with the entire catalogue, then applies one filter after the other. `item: book seller: John` would first filter all listings down to `item: book` then filter that list by `seller: John`.

All arguments for search are optional. If no valid arguments are provided then it'd just return all listings.

### Updating a listing

A listing is updated by referencing the item with the `item:` argument, then updating it with any arguments that follow, for example:

`!cat update item: book price: 10 gold`

This example would update the price of this user's book listing to 10 gold.

This command also supports other arguments such as: `quantity:`, `price:`, `location:`. The item can be renamed with `new_item:`


### Removing a listing

The simplest way to remove a listing, is:

`!cat remove item: [item]`

This command accepts the same argument as adding a listing.