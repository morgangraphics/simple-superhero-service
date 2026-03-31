const Boom = require('@hapi/boom');
const apiUtil = require('../components/api');
const common = require('./_common');
const fileUtil = require('../components/files');

const universe = 'dc';
const api = new apiUtil.ApiUtils(universe);
const file = new fileUtil.FileUtils(universe);

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
            const options = { ...req.query, ...{ universe } };
            let response;
            if ('help' in options) {
                const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
                response = handlr.response(hlp)
                    .header('Content-Type', 'text/plain')
                    .header('x-simple-superhero-service', common.VERSION);
            }
            if (!('help' in options)) {
                const config = api.handleConfig(options);
                response = file.readCharacterFile(config)
                    .then(data => {
                        const d = config.pretty ? JSON.stringify(data, null, 4) : data;
                        return handlr.response(d)
                            .header('Content-Type', 'application/json')
                            .header('x-simple-superhero-service', common.VERSION);
                    })
                    .catch(err => {
                        console.error(err);
                        return Boom.badRequest('Request failed');
                    });
            }
            return response;
        },
        description: api.popText('base.description'),
        notes: api.popText('base.notes'),
        tags: ['api'],
        validate: {
            query: api.validateParams(common.validBaseQParams, 'get'),
        },
    },
};
/**
 * Base dc POST endpoint — accepts filters as JSON payload
 * Returns an array of DC characters based on the filters passed in
 * @type {Object}
 */
const dcPostBase = {
    method: 'POST',
    path: '/dc',
    options: {
        handler: (req, handlr) => {
            const options = { ...req.query, ...req.payload, ...{ universe } };
            let response;
            if ('help' in options) {
                const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
                response = handlr.response(hlp)
                    .header('Content-Type', 'text/plain')
                    .header('x-simple-superhero-service', common.VERSION);
            }
            if (!('help' in options)) {
                const config = api.handleConfig(options);
                response = file.readCharacterFile(config)
                    .then(data => {
                        const d = config.pretty ? JSON.stringify(data, null, 4) : data;
                        return handlr.response(d)
                            .header('Content-Type', 'application/json')
                            .header('x-simple-superhero-service', common.VERSION);
                    })
                    .catch(err => {
                        console.error(err);
                        return Boom.badRequest('Request failed');
                    });
            }
            return response;
        },
        description: api.popText('character.description'),
        notes: api.popText('character.notes').concat(api.popText('character.notesExtended')),
        tags: ['api'],
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
    path: '/dc/{characters}',
    options: {
        handler: (req, handlr) => {
            const options = {
                ...req.query, ...req.payload, ...req.params, ...{ universe },
            };
            let response;
            if ('help' in options) {
                const hlp = (!options.characters) ? api.helpBase : api.helpSearch();
                response = handlr.response(hlp)
                    .header('Content-Type', 'text/plain')
                    .header('x-simple-superhero-service', common.VERSION);
            }
            if (!('help' in options)) {
                const config = api.handleConfig(options);
                response = file.readCharacterFile(config)
                    .then(data => {
                        const d = config.pretty ? JSON.stringify(data, null, 4) : data;
                        return handlr.response(d)
                            .header('Content-Type', 'application/json')
                            .header('x-simple-superhero-service', common.VERSION);
                    })
                    .catch(err => {
                        console.error(err);
                        return Boom.badRequest('Request failed');
                    });
            }
            return response;
        },
        description: api.popText('character.description'),
        notes: api.popText('character.notes'),
        tags: ['api'],
        validate: {
            params: api.validateParams(['characters'], 'get'),
            query: api.validateParams(common.validCharQParams, 'get'),
        },
    },
};

const routes = [
    dcGetBase,
    dcPostBase,
    dcGetByCharacter,
];

module.exports = routes;
