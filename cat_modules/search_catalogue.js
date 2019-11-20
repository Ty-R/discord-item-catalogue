exports.run = (catalogue, args) => {
  function queryFromFlag(flag) {
    switch(flag) {
      case 's': // (s)eller
        return 'seller';
      case 'u': // (u)ser (seller alt)
        return 'seller';
      case 'i': // (i)tem
        return 'item';
      case 'b': // (b)lock (item alt)
        return 'item';
      case 'l': // (l)ocation
        return 'location';
      case 'p': // (p)rice
        return 'price';
    }

    return 'item'; // default to item if no flag is specified
  }

  const query = args.action === 'update' ? 'item' : queryFromFlag(args.flag);

  console.log(`Searching listings by: ${query}`);

  try {
    const listings = catalogue.listings.filter(listing => listing[query]);
    return listings.filter(listing => listing[query].includes(args.primary));
  } catch(error) {
    console.log(`Search for '${query}' failed: ${error}.`);
    return [];
  }
}
