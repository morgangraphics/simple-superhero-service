const Boom = require('@hapi/boom');
/**
 * For some reason this catch all won't work when you have CORS set
 * in the routes.cors section when setting up a server unless you specify OPTIONS explicitly
 * CORS headers are partially handled automagically from Hapi and do not allow for much
 * configuration
 * Must implement it ourselves
 * https://github.com/hapijs/hapi/issues/2968
 * https://github.com/hapijs/hapi/issues/3238
 */

const preflight = {
    method: 'OPTIONS',
    path: '/{p*}',
    options: {
        cors: {
            origin: ['*'],
        },
        handler: (req, handlr) => handlr.response().header('access-control-allow-methods', 'GET,OPTIONS,POST'),
    },
};

// This catch-all route is resource the preflight request can satisfy
const fourOFour = {
    method: '*',
    path: '/{p*}',
    options: {
        cors: {
            origin: ['*'],
        },
        handler: () => Boom.notFound('Path not found'),
    },
};

const routes = [preflight, fourOFour];

module.exports = routes;
