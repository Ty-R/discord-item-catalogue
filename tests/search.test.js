const search = require('../commands/search');
require('./test.setup')

describe('Searching', () => {
  const args = {
    user:   'User',
    userId: '123',
    action: 'search'
  };

  it('should return results if listings are found', () => {
    args.primary = '1 book';
    return search.execute(args).then(result => expect(result.message).toMatch('That item search returned 1 result'));
  });

  it('should return no results if no listings are found', () => {
    args.primary = 'abc123';
    return search.execute(args).then(result => expect(result.message).toMatch('That item search returned 0 results'));
  });

  it('should return detailed results if -v is given', () => {
    args.primary = 'book';
    args.flag = 'v';
    return search.execute(args).then(result => expect(result.message).toMatch('[**id:** 1, **owner:** User]'));
  });

  it('should return user results if -u is given', () => {
    args.primary = 'User';
    args.flag = 'u';
    return search.execute(args).then(result => expect(result.message).toMatch('That seller search returned'));
  });

  it('should return location results if -l is given', () => {
    args.primary = 'plot 5';
    args.flag = 'l';
    return search.execute(args).then(result => expect(result.message).toMatch('That location search returned'));
  });

  it('should return location results if @ is given', () => {
    args.primary = '@plot 5';
    return search.execute(args).then(result => expect(result.message).toMatch('That location search returned'));
  });
});
