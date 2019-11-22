const winston = require('winston');

// https://www.npmjs.com/package/winston#further-reading
//
// In order to use this same logger configuration across
// multiple modules we need to create a 'default logger'.
// Once this is created then any modules that require
// winston will automatically use this configuration.

winston.configure({
  transports: [
    new winston.transports.File({ filename: 'cata.log' })
  ]
});