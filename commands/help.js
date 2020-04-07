module.exports = {
  name: 'help',
  execute() {
    const description = require('../help.json');

    return Promise.resolve({
      success: true,
      message: description
    });
  }
}
