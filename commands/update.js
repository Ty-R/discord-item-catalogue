module.exports = {
  name: 'update',
  usage: 'update [option] [listing ID]:[updated value]',
  execute(args) {
    const fieldFromFlag = require('../cat_modules/field_from_flag');
    const db = require('../cat_modules/db').load();

    const ids = args.primary.split(',').map(id => `"${id}"`);
    let sql = `UPDATE listings
               SET ${fieldFromFlag.run(args.flag)} = ?
               WHERE id in (${ids})
               AND userId = "${args.user.id}"`;

    return new Promise((resolve, reject) => {
      db.run(sql, args.secondary, function(err) {
        if (err) reject(err);
        if (this.changes > 0) {
          resolve({
            success: true,
            message: "That's all done for you."
          });
        } else {
          resolve({
            success: false,
            message: "I couldn't find any listings that belonged to you with the IDs given."
          });
        }
      });
    });
  },

  valid(args) {
    return !!args.flag && !!args.primary && !!args.secondary;
  }
}
