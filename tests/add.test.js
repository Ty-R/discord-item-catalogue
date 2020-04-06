const add = require('../commands/add');
const testHelper = require('./test.setup')

describe('Adding', () => {
  it('should allow a user to add a listing to the catalogue', () => {
    return add.execute(testHelper.itemArgs).then(result => expect(result.success).toBe(true));
  });
});
