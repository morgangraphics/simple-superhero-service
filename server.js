const config = require('config');
const fs = require('fs');
const hapi = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const http2 = require('http2');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Routes = require('./api/index');

const hapiPlugins = [];

/**
 * Default environment configuration options
 * WARNING! NOT ENVIRONMENT VARIABLES LIKE process.env.NODE_ENV
 * If needed elsewhere, this will need to be redone
 * @type {[type]}
 */
const env = config.get(process.env.NODE_ENV || 'development');

console.log('env = ', env)

/**
 * TLS Configuration with Self Signed Certs
 * allowHTTP1 is needed for Software that does not support
 * HTTP2 like Postman :(
 * @type {Object}
 */
const listener = http2.createSecureServer({
  allowHTTP1: true,
  cert: fs.readFileSync('./sss-cert.pem'),
  key: fs.readFileSync('./sss-key.pem'),
});

/**
 * Hapi Server configuration
 * tls: true is needed to tell hapi.js that TLS is running when you pass in a custom listener
 * https://github.com/hapijs/hapi/issues/4437 explains the issue in detail, when applying CORS configuration here
 * you have to explicitly allow ["*"] at the routes you dont need the ORIGIN enforced
 * @type {[type]}
 */
const server = hapi.server({
  host: env.HOST || 'localhost',
  listener,
  port: env.PORT || 3000,
  router: {
    stripTrailingSlash: true,
  },
  routes: {
    cors: {
      origin: env.ORIGIN || ['*'],
      headers: ['Accept', 'Authorization', 'Content-Type'],
      //additionalHeaders = access-control-allow-headers
      exposedHeaders: ['x-simple-superhero-service'],
    },
    payload: {
      allow: ['application/json', 'application/*+json'],
    },
    security: true,
  },
  tls: true,
});


if (env.SWAGGER_ENABLED) {

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

  hapiPlugins.push(
    Inert,                        // Static Files
    Vision,                       // Template Rendering
    {                             // Swagger
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  );
};

const banner = (server) => {
  const swggr = (env.SWAGGER_ENABLED)? `\n Swagger Interface: ${server.info.uri}/documentation#! \n` : ''
  const main = `

              ██████  ██▓ ███▄ ▄███▓ ██▓███   ██▓    ▓█████
            ▒██    ▒ ▓██▒▓██▒▀█▀ ██▒▓██░  ██▒▓██▒    ▓█   ▀
            ░ ▓██▄   ▒██▒▓██    ▓██░▓██░ ██▓▒▒██░    ▒███
              ▒   ██▒░██░▒██    ▒██ ▒██▄█▓▒ ▒▒██░    ▒▓█  ▄
            ▒██████▒▒░██░▒██▒   ░██▒▒██▒ ░  ░░██████▒░▒████▒
            ▒ ▒▓▒ ▒ ░░▓  ░ ▒░   ░  ░▒▓▒░ ░  ░░ ▒░▓  ░░░ ▒░ ░
            ░ ░▒  ░ ░ ▒ ░░  ░      ░░▒ ░     ░ ░ ▒  ░ ░ ░  ░
            ░  ░  ░   ▒ ░░      ░   ░░         ░ ░      ░
                  ░   ░         ░                ░  ░   ░  ░

    ██████  █    ██  ██▓███  ▓█████  ██▀███   ██░ ██ ▓█████  ██▀███   ▒█████
  ▒██    ▒  ██  ▓██▒▓██░  ██▒▓█   ▀ ▓██ ▒ ██▒▓██░ ██▒▓█   ▀ ▓██ ▒ ██▒▒██▒  ██▒
  ░ ▓██▄   ▓██  ▒██░▓██░ ██▓▒▒███   ▓██ ░▄█ ▒▒██▀▀██░▒███   ▓██ ░▄█ ▒▒██░  ██▒
    ▒   ██▒▓▓█  ░██░▒██▄█▓▒ ▒▒▓█  ▄ ▒██▀▀█▄  ░▓█ ░██ ▒▓█  ▄ ▒██▀▀█▄  ▒██   ██░
  ▒██████▒▒▒▒█████▓ ▒██▒ ░  ░░▒████▒░██▓ ▒██▒░▓█▒░██▓░▒████▒░██▓ ▒██▒░ ████▓▒░
  ▒ ▒▓▒ ▒ ░░▒▓▒ ▒ ▒ ▒▓▒░ ░  ░░░ ▒░ ░░ ▒▓ ░▒▓░ ▒ ░░▒░▒░░ ▒░ ░░ ▒▓ ░▒▓░░ ▒░▒░▒░
  ░ ░▒  ░ ░░░▒░ ░ ░ ░▒ ░      ░ ░  ░  ░▒ ░ ▒░ ▒ ░▒░ ░ ░ ░  ░  ░▒ ░ ▒░  ░ ▒ ▒░
  ░  ░  ░   ░░░ ░ ░ ░░          ░     ░░   ░  ░  ░░ ░   ░     ░░   ░ ░ ░ ░ ▒
        ░     ░                 ░  ░   ░      ░  ░  ░   ░  ░   ░         ░ ░

            ██████ ▓█████  ██▀███   ██▒   █▓ ██▓ ▄████▄  ▓█████
          ▒██    ▒ ▓█   ▀ ▓██ ▒ ██▒▓██░   █▒▓██▒▒██▀ ▀█  ▓█   ▀
          ░ ▓██▄   ▒███   ▓██ ░▄█ ▒ ▓██  █▒░▒██▒▒▓█    ▄ ▒███
            ▒   ██▒▒▓█  ▄ ▒██▀▀█▄    ▒██ █░░░██░▒▓▓▄ ▄██▒▒▓█  ▄
          ▒██████▒▒░▒████▒░██▓ ▒██▒   ▒▀█░  ░██░▒ ▓███▀ ░░▒████▒
          ▒ ▒▓▒ ▒ ░░░ ▒░ ░░ ▒▓ ░▒▓░   ░ ▐░  ░▓  ░ ░▒ ▒  ░░░ ▒░ ░
          ░ ░▒  ░ ░ ░ ░  ░  ░▒ ░ ▒░   ░ ░░   ▒ ░  ░  ▒    ░ ░  ░
          ░  ░  ░     ░     ░░   ░      ░░   ▒ ░░           ░
                ░     ░  ░   ░           ░   ░  ░ ░         ░  ░
                                        ░       ░

=============================================================================
    Server running at: ${server.info.uri}

    Marvel: ${server.info.uri}/marvel
        DC: ${server.info.uri}/dc
    ${swggr}
=============================================================================
`;
  return main;
};

/**
 * Asynchronously start hapi server
 * @param  {[type]} async [description]
 * @return {[type]}       [description]
 */
(async () => {
  await server.register(hapiPlugins);
  try {
    await server.start();
    server.route(Routes);
    console.log(banner(server));
    //console.log('server config = ', server);
    
    //console.log('server config = ', server._core.router.routes.get('get').routes[2]);
  } catch (err) {
    console.log(err);
  }
})();

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
process.on('SIGHUP', (err) => {
  console.log(`*^!@4=> Received event: ${err}`)
})