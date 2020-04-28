const api = require('../components/api');
const common = require('./_common');

/**
 * Base dc Endpoint
 * Returns an array of dc Characters based on filters passed in
 * @type {Object}
 */
const dcGetBase = {
  method: 'GET',
  path: '/dc',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, { universe: 'dc' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('dc', 'base.description'),
    notes: api.popText('dc', 'base.notes'),
    tags: ['api'], // ADD THIS TAG
    validate: {
      query: api.validateParams(common.validBaseQParams, 'get'),
    },
  },
};
/**
 * [dclPostBase description]
 * @type {Object}
 */
const dcPostBase = {
  method: 'POST',
  path: '/dc',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, req.payload, { universe: 'dc' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('dc', 'character.description'),
    notes: api.popText('dc', 'character.notes').concat(api.popText('dc', 'character.notesExtended')),
    tags: ['api'], // ADD THIS TAG
    validate: {
      payload: api.validateParams(common.validBaseQParams, 'post'),
    },
  },
};

/**
 * DCGetByCharacter endpoint for when you are searching for something specific
 * @type {Object}
 */
const dcGetByCharacter = {
  method: ['GET'],
  path: '/dc/{character}',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, req.payload, req.params, { universe: 'dc' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('dc', 'character.description'),
    notes: api.popText('dc', 'character.notes'),
    tags: ['api'], // ADD THIS TAG
    validate: {
      params: api.validateParams(['character'], 'post'),
      query: api.validateParams(common.validCharQParams, 'get'),
    },
  },
};

const routes = {
  ...dcGetBase,
  ...dcPostBase,
  ...dcGetByCharacter,
};

module.exports = routes;
