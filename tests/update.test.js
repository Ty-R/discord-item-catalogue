const update = require('../commands/update');
require('./test.setup');

describe('Help', () => {
  const args = {
    user: 'User',
    action: 'update'
  };

  it('should update the name of the listing if -i is given', () => {
    args.flag = 'i';
    args.primary = '1';
    args.secondary = '3 books';
    return update.execute(args).then(result => expect(result.message).toMatch("That's all done for you."));
  });

  it('should not allow creating a duplicate listing', () => {
    args.flag = 'i';
    args.primary = '1';
    args.secondary = '2 books';
    return update.execute(args).catch(result => expect(result.code).toMatch('SQLITE_CONSTRAINT'));
  });

  it('should update the price of the listing if -p is given', () => {
    args.flag = 'p';
    args.primary = '1';
    args.secondary = '15 gold';
    return update.execute(args).then(result => expect(result.message).toMatch("That's all done for you."));
  });

  it('should update the location of the listing if -l is given', () => {
    args.flag = 'l';
    args.primary = '1';
    args.secondary = '15 gold';
    return update.execute(args).then(result => expect(result.message).toMatch("That's all done for you."));
  });
});
