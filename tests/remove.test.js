const remove = require('../commands/remove');
const testHelper = require('./test.setup');

afterEach(() => {
  return testHelper.cleanDb();
});

const args = {
  user: { id: 1, discordId: '1' },
  primary: '1',
}

describe("When removing other user's listing", () => {
  console.log('1')
  beforeEach(() => {
    return testHelper.addListings({
      userId: 2,
      count: 1
    });
  });

  it('should respond with an error', () => {
    return remove.execute(args).then(result => {
      expect(result.success).toBe(false);
      expect(result.changes).toBe(0);
    });
  });
});

describe('When removing a listing', () => {
  console.log('2')
  beforeEach(() => {
    return testHelper.addListings({
      userId: 1,
      count: 1
    });
  });

  it('should remove one listing', () => {
    console.log('3')
    return remove.execute(args).then(result => {
      expect(result.success).toBe(true);
      expect(result.changes).toBe(1);
    });
  });
});

describe('When removing two listings at once', () => {
  console.log('4')
  beforeEach(() => {
    return testHelper.addListings({
      userId: 1,
      count: 2
    });
  });

  it('should remove both listings', () => {
    args.primary = '1, 2';
    return remove.execute(args).then(result => {
      expect(result.success).toBe(true);
      expect(result.changes).toBe(2);
    });
  });
});

describe("When removing a listing that doesn't exist", () => {
  console.log('5')
  it('should respond with an error', () => {
    return remove.execute(args).then(result => {
      expect(result.success).toBe(false);
      expect(result.changes).toBe(0);
    });
  });
});
