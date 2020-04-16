const Boom = require('boom');
const api = require('../components/api');
const common = require('./_common');


/**
 * Base Marvel Endpoint
 * Returns an array of Marvel Characters based on filters passed in
 * @type {Object}
 */
const marvelGetBase = {
  method: 'GET',
  path: '/marvel',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, { universe: 'marvel' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('marvel', 'base.description'),
    notes: api.popText('marvel', 'base.notes'),
    tags: ['api'], // ADD THIS TAG
    validate: {
      query: api.validateParams(common.validBaseQParams, 'get'),
    },
  },
};
/**
 * [marvelPostBase description]
 * @type {Object}
 */
const marvelPostBase = {
  method: 'POST',
  path: '/marvel',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, req.payload, { universe: 'marvel' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('marvel', 'character.description'),
    notes: api.popText('marvel', 'character.notes').concat(api.popText('marvel', 'character.notesExtended')),
    tags: ['api'], // ADD THIS TAG
    validate: {
      payload: api.validateParams(common.validBaseQParams, 'post'),
    },
  },
};

/**
 * MarvelGetByCharacter endpoint for when you are searching for something specific
 * @type {Object}
 */
const marvelGetByCharacter = {
  method: ['GET'],
  path: '/marvel/{character}',
  options: {
    handler: (req, handlr) => {
      const options = Object.assign({}, req.query, req.payload, req.params, { universe: 'marvel' });
      const config = api.handleConfig(options);
      return api.handleRequest(config, handlr);
    },
    description: api.popText('marvel', 'character.description'),
    notes: api.popText('marvel', 'character.notes'),
    tags: ['api'], // ADD THIS TAG
    validate: {
      params: api.validateParams(['character'], 'post'),
      query: api.validateParams(common.validCharQParams, 'get'),
    },
  },
};

const routes = [
  marvelGetBase,
  marvelPostBase,
  marvelGetByCharacter,
];

module.exports = routes;
