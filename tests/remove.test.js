const remove = require('../commands/remove');
require('./test.setup')

describe('Removing', () => {
  const args = {
    user:   'User',
    action: 'remove'
  }

  it('should not allow removing other users listings', () => {
    args.primary = '4';
    return remove.execute(args).then(result => expect(result.message).toMatch("I couldn't find any listings that belonged to you with the IDs given."));
  });

  it('should allow removing listings the user created', () => {
    args.primary = '1';
    return remove.execute(args).then(result => expect(result.message).toMatch("That's all done for you."));
  });

  // it('should allow removing listings in bulk', () => {
  //   args.primary = '1, 2';
  //   return remove.execute(args).then(result => expect(result.message).toMatch("That's all done for you."));
  // });

  it('should handle IDs belonging to no listing', () => {
    args.primary = '10000';
    return remove.execute(args).then(result => expect(result.message).toMatch("I couldn't find any listings that belonged to you with the IDs given."));
  });
});
