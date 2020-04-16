const healthcheck = require('./healthcheck');
const dc = require('./dc');
const marvel = require('./marvel');

const routes = []
  .concat(
    healthcheck,
    dc,
    marvel,
  );

module.exports = routes;
