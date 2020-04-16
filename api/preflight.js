/**
 * For some reason this catch all won't work when you have CORS set
 * in the routes.cors section when setting up a server unless you specify OPTIONS explicitly
 * CORS headers are partially handled automagically from Hapi and do not allow for much
 * configuration
 * Must implement it ourselves
 * https://github.com/hapijs/hapi/issues/2968
 * https://github.com/hapijs/hapi/issues/3238
 */


// const preflight = {
//   method: 'OPTIONS',
//   path: '/{p*}',
//   options: {
//     handler: (req, handlr) => {
//       return handlr.response().header('access-control-allow-methods', 'GET,POST');
//       // throw Boom.notFound('Cannot find the requested page');
//       // const d = {
//       //   message: 'CORS error: Method not allowed',
//       // };
//       // return handlr.response(d).header('Content-Type', 'application/json');
//     },
//   },
// };

// const routes = [healthcheck]
//
// module.exports = routes;
