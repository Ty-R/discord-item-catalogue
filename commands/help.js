module.exports = {
  name: 'help',
  execute() {
    const description = require('../help.json');

    const actionResult = new Promise((resolve, reject) => {
      resolve({
        success: true,
        message: description
      });
    });

    return actionResult;
  },

  valid(args) {
    return true;
  }
}
