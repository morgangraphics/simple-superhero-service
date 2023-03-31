const common = require('./_common');

const healthcheck = {
    method: 'GET',
    path: '/healthcheck',
    options: {
        cors: {
            origin: ['*'],
        },
        handler: (req, handlr) => handlr.response({ status: 'OK' })
            .header('Content-Type', 'application/json')
            .header('x-simple-superhero-service', common.VERSION),
        description: 'Test if the Service is up',
        notes: [],
        tags: ['api'], // ADD THIS TAG
    },
};

const routes = [
    healthcheck,
];

module.exports = routes;
