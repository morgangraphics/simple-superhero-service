const healthcheck = {
  method: 'GET',
  path: '/healthcheck',
  options: {
    cors: false,
    handler: () => ({ status: 'Ok' }),
    description: 'Test if the Service is up',
    notes: [],
    tags: ['api'], // ADD THIS TAG
  },
};

const routes = [healthcheck]

module.exports = routes;
