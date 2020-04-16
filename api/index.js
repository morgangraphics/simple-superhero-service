const healthcheck = require('./healthcheck');
const dc = require('./dc');
const marvel = require('./marvel');

module.exports = [].concat(healthcheck, marvel, dc);
