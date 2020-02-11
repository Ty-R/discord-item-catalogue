exports.run = (flag) => {
  if (!flag) return 'item';
  const focusFlag = flag.replace(/v/, '');

  switch(focusFlag) {
    case 's': // (s)eller
      return 'name';
    case 'u': // (u)ser (seller alt)
      return 'name';
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