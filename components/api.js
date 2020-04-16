const Boom = require('boom');
const Joi = require('joi');
const getValue = require('get-value');

const common = require('../api/_common');
const file = require('../components/files');
const utils = require('../components/utils');

/**
 * String interpolation respects spacing, therefore we have a bunch of spacing so it aligns properly
 * when output to browser
 * Description of available columns
 * @type {String}
 */
const cols = `
             |   |          | Variable          | Definition
             |   |          | ------------------|----------------
             |   |          | page_id           | The unique identifier for that characters page within the wikia
             |   |          | name              | The name of the character
             |   |          | urlslug           | The unique url within the wikia that takes you to the character
             |   |          | id                | The identity status of the character (Secret Identity, Public identity, [on marvel only: No Dual Identity])
             |   |          | align             | If the character is Good, Bad or Neutral
             |   |          | eye               | Eye color of the character
             |   |          | hair              | Hair color of the character
             |   |          | sex               | Sex of the character (e.g. Male, Female, etc.)
             |   |          | gsm               | If the character is a gender or sexual minority (e.g. Homosexual characters, bisexual characters)
             |   |          | alive             | If the character is alive or deceased
             |   |          | appearances       | The number of appareances of the character in comic books (as of Sep. 2, 2014. Number will become increasingly out of date as time goes on.)
             |   |          | first appearance  | The month and year of the character’s first appearance in a comic book, if available
             |   |          | year              | The year of the character’s first appearance in a comic book, if available
             |   |`;

/**
 * Available filter help
 * @type {[type]}
 */
const helpBase = `
  format     |   | json     | Output format (currently only JSON)
  headers    | h | all      | Available Columns (page_id, name, urlslug, id, align, eye, hair, sex, gsm, alive, appearances, first appearance, year)
             |   |          | ${cols}
  help       |   | false    | Display Help
  limit      |   | 100      | Limit results ( 0 = unlimited)
  pretty     |   | false    | Pretty print JSON results
  random     |   | false    | Array of random characters based on limit
  seed       |   | false    | Keep the same random characters on multiple requests
  sort       | s | unsorted | Sort response asc|desc e.g. s=name,appearances:desc
`;

/**
 * [helpSearch description]
 * @param  {[type]} universe [description]
 * @return {[type]}          [description]
 */
const helpSearch = universe => `
  character  |   | empty    | Output format (currently only JSON)
             |   |          | {keyword1},{keyword2} e.g. ${universe.characters[0]},${universe.characters[1]} will search for each character individually
             |   |          | {keyword1}+{keyword2} e.g. ${universe.search[0]}+${universe.search[1]} will search for a character name with both '${universe.search[0]}' AND '${universe.search[1]}' in it
             |   |          | {keyword1},-{keyword2} e.g. ${universe.characters[0]},${universe.exclude} will search for character names containing '${universe.characters[0]}' EXCLUDING results with ${universe.exclude} in it
             |   |          |
  format     |   | json     | Output format (currently only JSON)
  headers    | h | all      | Available Columns (page_id, name, urlslug, id, align, eye, hair, sex, gsm, alive, appearances, first appearance, year)
             |   |          | ${cols}
  help       |   | false    | Display Help
  limit      |   | 100      | Limit results ( 0 = unlimited)
  pretty     |   | false    | Pretty print JSON results
  sort       | s | unsorted | Sort response asc|desc e.g. s=name,appearances:desc
`;

/**
 * Extended search help with examples - Only available on Character endpoints
 * @type {[type]}
 */
const srchExtended = `
**character: character can be a string, or an array of strings (preferred)** e.g.
  <pre><code>
   {
     "character": "spider-man,iron man"
   }
   OR
   {
     "character": ["spider-man", "iron man"]
   }
  </code></pre>
**h: h can be a string, or an array (preferred)** e.g.
  <pre><code>
   {
     "h": "name,appearances,year"
   }
   OR
   {
     "h": ["name", "appearances", "year"]
   }
  </code></pre>
**s: can be a string, an object, array of strings, or an array of objects (preferred)** e.g.
  <pre><code>
  {
    "s": "name:asc,appearances:desc"
  }
  OR
  {
    "s": {
       "column": "name",
       "sort": "asc"
     }
  }
  OR
  {
    "s": ["name:asc", "appearances:desc"]
  }
  OR
  {
    "s": [
      { "column": "name", "sort": "asc" },
      { "column": "appearances", "sort": "desc" }
    ]
  }
 </code></pre>
`;

const commonText = universe => ({
  base: {
    description: `Filterable response of ${universe.display} Character Universe Biographical information`,
    notes: [
      `Returns an array of JSON objects of ${universe.display} Character Universe Biographical Information as found from
       https://datahub.io/five-thirty-eight/comic-characters
       dataset`,
      'Shorthand query syntax is available for help, pretty, random and seed. Meaning their presence equates to true',
      ' e.g. <code>?pretty&random</code> and <code>?pretty=true&random=true</code> are functionally equivalent',
      '<sup>* Swagger parameter functionality below only allows for `?pretty=true|false` formatting for "Try it out" button</sup>',
    ],
  },
  character: {
    description: `Search for specific ${universe.display} Universe Character(s)`,
    notes: [
      `Returns an array of JSON objects of ${universe.display} Character Biographical Information as found from
       https://datahub.io/five-thirty-eight/comic-characters
       dataset`,
      'Shorthand query syntax is available for help, and pretty. Meaning their presence equates to true',
      ' e.g. <code>?pretty</code> and <code>?pretty=true</code> are functionally equivalent',
      '**character: character filters can used like:**',
      `{keyword1},{keyword2} e.g. ${universe.characters[0]},${universe.characters[1]} will search for each character individually`,
      `{keyword1}+{keyword2} e.g. ${universe.search[0]}+${universe.search[1]} will search for a character name with both '${universe.search[0]}' AND '${universe.search[1]}' in it`,
      `{keyword1},-{keyword2} e.g. ${universe.characters[0]},${universe.exclude} will search for character names containing '${universe.characters[0]}' EXCLUDING results with ${universe.exclude} in it`,
    ],
    notesExtended: [srchExtended],
  },
});

const handleConfig = (options) => {
  const config = {};
  // These are the only params we're concerned about - Object Destructuring
  const {
    character, format, h, help, limit, pretty, random, s, seed, universe,
  } = options;
  if (character) {
    config.character = utils.searchObj(character);
  }
  config.format = format;
  if (h) {
    let val;
    if (utils.isStr(h)) {
      val = h.split(',').map(v => v.toString());
    } else if (h instanceof Array) {
      val = h;
    } else {
      val = '';
    }
    config.h = val;
  }
  config.help = (help === true || help === '') || false;
  config.limit = limit;
  config.pretty = (pretty === true || pretty === '') || false;
  if (random) {
    config.random = (random === true || random === '') || false;
  }
  if (s) {
    config.s = utils.sortObj(s);
  }
  if (seed) {
    config.seed = (seed === true || seed === '') || false;
  }
  config.universe = universe;
  return config;
};

/**
 * Generic wrapper for handling Endpoint request
 * @param  {Object} config Configuration options object
 * @param  {Object} handlr Hapi.js Callback Handler Object
 * @return {Promise}       Promise response with result set
 */
const handleRequest = (config, handlr) => {
  let response;
  try {
    if (config.help) {
      const hlp = (!config.character) ? helpBase : helpSearch(common.docParams[config.universe]);
      response = handlr.response(hlp).header('Content-Type', 'text/plain');
    } else {
      response = file.readFile(config.universe, config)
        .then((data) => {
          const d = config.pretty ? JSON.stringify(data, null, 4) : data;
          return handlr.response(d).header('Content-Type', 'application/json');
        })
        .catch(err => Boom.badRequest(err.message))
        .finally(() => { });
    }
    return response;
  } catch (err) {
    return Boom.badRequest(err.message);
  }
};

/**
 * Populates the appropriate text for Swagger documentation based on universe and path
 * @param  {String} universe Marvel or DC
 * @param  {String} key      dot seperated path to key value e.g. base.notes
 * @return {String}          Swagger endpoint documentation
 */
const popText = (universe, key) => getValue(commonText(common.docParams[universe]), key);

/**
 * Hapi Endpoint Valiation Object. Makes sure data being passed in is
 * what we expect it to be and in the format we expect it in
 * @param  {Array} validParams Array of Query, Paramerter or Payload parameters to validate
 * @param  {String} method     get or post - depending on method, what kind of validation
 *                             should be first
 * @return {Object}            Joi validation object
 */
const validateParams = (validParams, method) => {
  let params = Joi.object().keys({
    format: Joi.string()
      .optional()
      .valid('json'),
  });
  const tfText = 'No default value is required, presence equates to true';
  const commaSepRegEx = /([a-zA-Z0-9_]+)(,[a-zA-Z0-9_]+)*/
  /**
    There is a limitation with Happi Swagger where alternatives (the validation of multiple
    kinds of parameterized data) is not accurately represented within the Swagger UI. The
    UI takes whatever the first entry is and ignores he rest. This is only an issue where
    I want to distinguish differences between GET and POST methods On GET methods, I want the String
    to be defaulted first, on POST Array should be the default. It's a small detail but
    one I think is work the extra effort
  */

  if (validParams.includes('character')) {
    const str = Joi.string()
      .description('Character(s) to search for')
      .label('String')
      .optional()
      .regex(commaSepRegEx);
    const arryStr = Joi.string()
      .label('character: characters');
    const arry = Joi.array()
      .description('Character(s) to search for. Either a string or Array of strings')
      .items(arryStr)
      .label('character: array of characters');

    const c = (method === 'post') ? Joi.alternatives().try(arry, arryStr) : Joi.alternatives().try(str);
    params = params.append({
      character: c.description('Character(s) to search for. Either a string or Array of strings'),
    });
  }

  if (validParams.includes('h')) {
    const str = Joi.string()
      .description('Headers to display')
      .label('String')
      .optional()
      .regex(commaSepRegEx);
    const arry = Joi.array()
      .description('Headers to display. Either a string or Array of strings')
      .items(
        Joi.string()
          .label('h: column name')
          .valid(common.columns),
      )
      .label('h: array of column names');


    const h = (method === 'post') ? Joi.alternatives().try(arry, str) : Joi.alternatives().try(str);
    params = params.append({
      h: h.description('Headers to display. Either a string or Array of strings'),
    });
  }

  if (validParams.includes('help')) {
    params = params.append({
      help: Joi.boolean()
        .allow('')
        .description(`List available options. ${tfText}`)
        .optional()
        .valid(true, false),
    });
  }

  if (validParams.includes('limit')) {
    params = params.append({
      limit: Joi.number()
        .default(100)
        .description('Limit result set. \'0\' for no limit')
        .integer()
        .min(0)
        .optional(),
    });
  }

  if (validParams.includes('pretty')) {
    params = params.append({
      pretty: Joi.boolean()
        .allow('')
        .description(`Pretty print the result set. ${tfText}`)
        .optional()
        .valid(true, false),
    });
  }

  if (validParams.includes('random')) {
    params = params.append({
      random: Joi.boolean()
        .allow('')
        .description(`Returns array of random characters based on limit. ${tfText}`)
        .optional()
        .valid(true, false),
    });
  }

  if (validParams.includes('s')) {
    const obj = Joi.object({
      column: Joi.required().valid(common.columns),
      sort: Joi.required().valid('asc', 'desc'),
    })
      .label('s: sort object');
    const arry = Joi.array()
      .description('Columns to sort on. Either a string or Array of strings')
      .items(obj)
      .label('s: array of sort objects');
    const str = Joi.string()
      .description('Columns to sort on')
      .example('s=name:asc')
      .label('s: string representation of sort object')
      .optional()
      .regex(/([a-zA-Z0-9_]+)(,[a-zA-Z0-9_]+)*:(a|de)sc/);

    const s = (method === 'post') ? Joi.alternatives().try(arry, obj, str) : Joi.alternatives().try(str, arry, obj);
    params = params.append({
      s,
    });
  }

  if (validParams.includes('seed')) {
    params = params.append({
      seed: Joi.boolean()
        .allow('')
        .description(`Keep the same random characters on multiple requests. ${tfText}`)
        .optional()
        .valid(true, false),
    });
  }

  params = params.options({ stripUnknown: true })
    .optional()
    .description('Filter Params')
    .label('body');

  return params;
};

module.exports = {
  handleConfig,
  handleRequest,
  popText,
  validateParams,
};
