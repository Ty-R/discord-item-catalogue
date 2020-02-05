exports.run = (userId) => {
  const { admin_ids } = require('../config.json');
  return admin_ids.includes(userId);
}
