const healthcheck = require('./healthcheck');
const dc = require('./dc');
const marvel = require('./marvel');
const preflight = require('./preflight');

const routes = [
    ...preflight,
    ...healthcheck,
    ...dc,
    ...marvel,
];

module.exports = routes;
