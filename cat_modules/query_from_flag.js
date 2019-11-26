exports.run = (flag) => {
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