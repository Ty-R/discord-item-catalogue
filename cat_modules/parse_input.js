exports.run = (message, action) => {
  const pattern = {
    "add": "(?<item>[^:]*):(?<price>[^:]*)",
    "remove": "(?<listing>.*)",
    "search": "(?<focus>(name|user|listings|seller)\\b)?\\s?(?<term>.*)"
  }[action]

  const args = message.content.match(`${action}\\s+${pattern}`);
  return args ? args.groups : {};
}
