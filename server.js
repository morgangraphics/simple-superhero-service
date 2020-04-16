const config = require('config');
const fs = require('fs');
const hapi = require('hapi');
const HapiSwagger = require('hapi-swagger');
const http2 = require('http2');
const Inert = require('inert');
const Vision = require('vision');
const Routes = require('./api/index');

/**
 * Default environment configuration options
 * WARNING! NOT ENVIRONMENT VARIABLES LIKE process.env.NODE_ENV
 * If needed elsewhere, this will need to be redone
 * @type {[type]}
 */
const env = config.get(process.env.NODE_ENV || 'development');

/**
 * TLS Configuration with Self Signed Certs
 * allowHTTP1 is needed for Software that does not support
 * HTTP2 like Postman :(
 * @type {Object}
 */
const tls = {
  key: fs.readFileSync('./sss-key.pem'),
  cert: fs.readFileSync('./sss-cert.pem'),
  allowHTTP1: true,
};

const listener = http2.createSecureServer(tls);

/**
 * Hapi Server configuration
 * @type {[type]}
 */
const server = hapi.server({
  host: env.HOST || 'localhost',
  listener,
  port: env.PORT || '3000',
  router: {
    stripTrailingSlash: true,
  },
  routes: {
    cors: {
      origin: env.ORIGIN || '*',
      headers: ['Accept', 'Content-Type'],
      // additionalHeaders = access-control-allow-headers
      // additionalHeaders: [],
    },
    payload: {
      allow: ['application/json', 'application/*+json'],
    },
    security: true,
  }
});

const swgrDesc = `I needed a self-contained data service (no Database) for testing a number of different scenarios with a diverse and robust dataset that also contains some sparseness.

Service runs on Node and hapijs.

The service itself and the data contained within service is useful for testing:

1. CORS configuration
1. Server configuration
1. Bandwidth
1. Form population
1. Data visualization
1. Stubbing out UI components
...

Data is the comic book character dataset from [fivethrityeight](https://datahub.io/five-thirty-eight/comic-characters#readme)`;

const swaggerOptions = {
  info: {
    title: 'Simple Superhero Service API Documentation',
    description: swgrDesc,
    contact: {
      name: 'MORGANGRAPHICS',
      url: `https://github.com/morgangraphics`
    }
  },
  schemes: ['https'],
  host: `${env.HOST || 'localhost'}:${env.PORT || 3000}`,
  uiCompleteScript: `
    $(document).ready(() => {
      // $('input[name=help],input[name=pretty],input[name=random],input[name=seed]').toggle(false);
    });
  `,
};

/**
 * Asynchronously start hapi server
 * @param  {[type]} async [description]
 * @return {[type]}       [description]
 */
(async () => {
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);
  try {
    await server.start();
    server.route(Routes);
    console.log(`Server running at: ${server.info.uri}`);
  } catch (err) {
    console.log(err);
  }
})();

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
