const healthcheck = require('./healthcheck');
const dc = require('./dc');
const marvel = require('./marvel');

const routes = [
  ...healthcheck,
  ...dc,
  ...marvel,
];

module.exports = routes;
