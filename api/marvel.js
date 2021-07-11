const Boom = require('boom');
const apiUtil = require('../components/api');
const common = require('./_common');
const fileUtil = require('../components/files');

const universe = 'marvel';
const api = new apiUtil.ApiUtils(universe);
const file = new fileUtil.FileUtils(universe);

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
      const options = { ...req.query, ...{ universe } };
      let response;
      if ('help' in options) {
        const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
        response = handlr.response(hlp).header('Content-Type', 'text/plain');
      }
      if (!('help' in options)) {
        const config = api.handleConfig(options);
        response = file.readCharacterFile(config)
          .then(data => {
            const d = config.pretty ? JSON.stringify(data, null, 4) : data;
            return handlr.response(d).header('Content-Type', 'application/json');
          })
          .catch(err => Boom.badRequest(err.message))
          .finally(() => { });
      }
      return response;
    },
    description: api.popText('base.description'),
    notes: api.popText('base.notes'),
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
      const options = { ...req.query, ...req.payload, ...{ universe } };
      let response;
      if ('help' in options) {
        const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
        response = handlr.response(hlp).header('Content-Type', 'text/plain');
      }
      if (!('help' in options)) {
        const config = api.handleConfig(options);
        response = file.readCharacterFile(config)
          .then(data => {
            const d = config.pretty ? JSON.stringify(data, null, 4) : data;
            return handlr.response(d).header('Content-Type', 'application/json');
          })
          .catch(err => Boom.badRequest(err.message))
          .finally(() => { });
      }
      return response;
    },
    description: api.popText('character.description'),
    notes: api.popText('character.notes').concat(api.popText('character.notesExtended')),
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
  path: '/marvel/{characters}',
  options: {
    handler: (req, handlr) => {
      const options = {
        ...req.query, ...req.payload, ...req.params, ...{ universe },
      };
      let response;
      if ('help' in options) {
        const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
        response = handlr.response(hlp).header('Content-Type', 'text/plain');
      }
      if (!('help' in options)) {
        const config = api.handleConfig(options);
        response = file.readCharacterFile(config)
          .then(data => {
            const d = config.pretty ? JSON.stringify(data, null, 4) : data;
            return handlr.response(d).header('Content-Type', 'application/json');
          })
          .catch(err => Boom.badRequest(err.message))
          .finally(() => { });
      }
      return response;
    },
    description: api.popText('character.description'),
    notes: api.popText('character.notes'),
    tags: ['api'], // ADD THIS TAG
    validate: {
      params: api.validateParams(['characters'], 'post'),
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
