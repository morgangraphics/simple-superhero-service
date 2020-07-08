const Joi = require('joi');
const getValue = require('get-value');

/**
 * Class surrounding API scaffolding and common API specific functionality
 */
class ApiUtils {
  /**
   * Sets some basic Class based variables
   * @param {String} universe comic book character universe
   */
  constructor(universe) {
    /**
     * String interpolation respects spacing, therefore we have a bunch of spacing
     * so it aligns properly when output to the browser
     * Description of available columns
     * @type {String}
     */
    this.cols = `
            |         |          | Variable          | Definition
            |         |          | ------------------|----------------
            |         |          | page_id           | The unique identifier for that characters page within the wikia
            |         |          | name              | The name of the character
            |         |          | urlslug           | The unique url within the wikia that takes you to the character
            |         |          | id                | The identity status of the character (Secret Identity, Public identity, [on marvel only: No Dual Identity])
            |         |          | align             | If the character is Good, Bad or Neutral
            |         |          | eye               | Eye color of the character
            |         |          | hair              | Hair color of the character
            |         |          | sex               | Sex of the character (e.g. Male, Female, etc.)
            |         |          | gsm               | If the character is a gender or sexual minority (e.g. Homosexual characters, bisexual characters)
            |         |          | alive             | If the character is alive or deceased
            |         |          | appearances       | The number of appearances of the character in comic books *
            |         |          | first appearance  | The month and year of the character’s first appearance in a comic book, if available
            |         |          | year              | The year of the character’s first appearance in a comic book, if available
            |         |          |`;

    /**
     * Available columns from dataset
     * @type {Array}
     */
    this.columns = ['name', 'page_id', 'urlslug', 'id', 'align', 'eye', 'hair', 'sex',
      'gsm', 'alive', 'appearances', 'first appearance', 'year'];

    /**
      * Parameters needed for Swagger Documentation. It differes slightly by Universe
      * @type {Object}
      */
    this.docParams = {
      marvel: {
        display: 'Marvel',
        characters: ['iron man', 'spider-man'],
        search: ['spider', 'man'],
        exclude: 'earth-616',
      },
      dc: {
        display: 'DC',
        characters: ['superman', 'batman'],
        search: ['bat', 'man'],
        exclude: '-woman',
      },
    };

    /**
    * Available filter help - Offset is needed to display properly in the browser
    * @type {String}
    */
    // eslint-disable-next-line indent
this.helpBase = `
 format     | format  | json     | Output format (currently only JSON)
 headers    | h       | all      | Available Columns (page_id, name, urlslug, id, align, eye, hair, sex, gsm, alive, appearances, first appearance, year)
            |         |          | ${this.cols}
 help       | help    | false    | Display Help
 limit      | limit   | 100      | Limit results ( 0 = unlimited)
 nulls      | nulls   | first    | null values sorted first or last e.g. [null, 1, 2, 3] or [1, 2, 3, null] †
 pretty     | pretty  | false    | Pretty print JSON results
 prune      | prune   | false    | Remove null values from output
 random     | random  | false    | Array of random characters based on limit
 seed       | seed    | false    | Keep the same random characters on multiple requests
 sort       | s       | unsorted | Sort response asc|desc e.g. s=name,appearances:desc

 * (as of Sep. 2, 2014. Number will become increasingly out of date as time goes on.)
 † Does not apply when sorting on column/header which contains a null value, records with null values are removed
`;

    /**
     * Default Limit amout = used in validation section which enforces it
     * @type {Number}
     */
    this.limit = 100;

    /**
   * Extended search help with examples - Only available on Character endpoints
   * @type {String}
   */
    // eslint-disable-next-line indent
this.srchExtended = `
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
    this.universe = universe;
  } // End Constructor

  /**
   * Help is different when searching for a speciic character
   * @return {String}          Properly formatted string
   */
  helpSearch() {
    return `
      character  |         | empty    | Output format (currently only JSON)
                 |         |          | {keyword1},{keyword2} e.g. ${this.docParams[this.universe].characters[0]},${this.docParams[this.universe].characters[1]} will search for each character individually
                 |         |          | {keyword1}+{keyword2} e.g. ${this.docParams[this.universe].search[0]}+${this.docParams[this.universe].search[1]} will search for a character name with both '${this.docParams[this.universe].search[0]}' AND '${this.docParams[this.universe].search[1]}' in it
                 |         |          | {keyword1},-{keyword2} e.g. ${this.docParams[this.universe].characters[0]},${this.docParams[this.universe].exclude} will search for character names containing '${this.docParams[this.universe].characters[0]}' EXCLUDING results with ${this.docParams[this.universe].exclude} in it
                 |         |          |
      format     | format  | json     | Output format (currently only JSON)
      headers    | h       | all      | Available Columns (page_id, name, urlslug, id, align, eye, hair, sex, gsm, alive, appearances, first appearance, year)
                 |         |          | ${this.cols}
      help       | help    | false    | Display Help
      nulls      | nulls   | first    | null values sorted first or last e.g. [null, 1, 2, 3] or [1, 2, 3, null] †
      limit      | limit   | 100      | Limit results ( 0 = unlimited)
      pretty     | pretty  | false    | Pretty print JSON results
      prune      | prune   | false    | Remove null values from output
      sort       | s       | unsorted | Sort response asc|desc e.g. s=name,appearances:desc

      † Does not apply when sorting on column/header which contains a null value, records with null values are removed
    `;
  }

  /**
   * [commonText description]
   * @return {Object}         returns preformatted string text to dispaly in Swagger UI
   */
  commonText() {
    return {
      base: {
        description: `Filterable response of ${this.docParams[this.universe].display} Character Universe Biographical information`,
        notes: [
          `Returns an array of JSON objects of ${this.docParams[this.universe].display} Character Universe Biographical Information as found from
           https://datahub.io/five-thirty-eight/comic-characters
           dataset`,
          'Shorthand query syntax is available for help, pretty, prune, random and seed. Meaning their presence equates to true',
          ' e.g. <code>?pretty&random</code> and <code>?pretty=true&random=true</code> are functionally equivalent',
          '<sup>* Swagger parameter functionality below only allows for `?pretty=true|false` formatting for "Try it out" button</sup>',
        ],
      },
      character: {
        description: `Search for specific ${this.docParams[this.universe].display} Universe Character(s)`,
        notes: [
          `Returns an array of JSON objects of ${this.docParams[this.universe].display} Character Biographical Information as found from
           https://datahub.io/five-thirty-eight/comic-characters
           dataset`,
          'Shorthand query syntax is available for help, pretty, and prune. Meaning their presence equates to true',
          ' e.g. <code>?pretty</code> and <code>?pretty=true</code> are functionally equivalent',
          '**character: character filters can used like:**',
          `{keyword1},{keyword2} e.g. ${this.docParams[this.universe].characters[0]},${this.docParams[this.universe].characters[1]} will search for each character individually`,
          `{keyword1}+{keyword2} e.g. ${this.docParams[this.universe].search[0]}+${this.docParams[this.universe].search[1]} will search for a character name with both '${this.docParams[this.universe].search[0]}' AND '${this.docParams[this.universe].search[1]}' in it`,
          `{keyword1},-{keyword2} e.g. ${this.docParams[this.universe].characters[0]},${this.docParams[this.universe].exclude} will search for character names containing '${this.docParams[this.universe].characters[0]}' EXCLUDING results with ${this.docParams[this.universe].exclude} in it`,
        ],
        notesExtended: [this.srchExtended],
      },
    };
  }

  /**
   * Internal Helper function to convert asc|desc to numeric value
   * @param  {String} val asc or desc
   * @return {Number}     numeric representation of asc (1) or desc (-1))
   */
  direction(val) { // eslint-disable-line class-methods-use-this
    return ((val === 'asc') ? 1 : -1);
  }

  /**
   * Normalizes configuration options by setting defaults
   * @param  {Object} options Object containing Parameters, Payload
   * and/or Querystring parameters
   * @return {Object}         Normalized configuration object
   */
  handleConfig(options) {
    const config = {};
    // These are the only params we're concerned about - Object Destructuring
    const {
      characters, format, h, help, limit, nulls, pretty, prune, random, s, seed, universe,
    } = options;
    if (characters) {
      config.characters = this.searchObj(characters);
    }
    config.format = format;
    if (h) {
      let val;
      if (this.isStr(h)) {
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
    config.nulls = nulls || 'first';
    config.pretty = (pretty === true || pretty === '') || false;
    if (random) {
      config.random = (random === true || random === '') || false;
    }
    config.prune = (prune === true || prune === '') || false;
    if (s) {
      config.s = this.sortObj(s);
    }
    if (seed) {
      config.seed = (seed === true || seed === '') || false;
    }
    config.universe = universe;
    return config;
  }

  /**
   * Parameters can come in several different formats. This private method
   * tests for the format and prepares it accordingly
   * @param  {String|Object|Array} param parameter sent to endpoint
   * @return {Array}       Array of parametes for further processing
   */
  handleParamTypes(param) {
    let response;
    if (this.isStr(param)) {
      response = param.split(',');
    } else if (param instanceof Array) {
      response = param;
    } else if (param instanceof Object) {
      response = [param];
    }
    return response;
  }

  /**
   * Quick helper to determine if something is a string
   * @param  {String}  str String to test
   * @return {Boolean}     If String is True|False
   */
  isStr(str) { // eslint-disable-line class-methods-use-this
    return (str instanceof String) || typeof (str) === 'string';
  }

  /**
   * Will attempt to make perumtations on names passed in so empty result sets are limited
   * e.g. spider man, spider-man, spiderman
   * @param  {String} name name of the character you are searching for
   * @return {Array}      Array of perumations
   */
  permutate(name) { // eslint-disable-line class-methods-use-this
    const options = [];
    const p = (name instanceof Array) ? name.map(itm => itm.trim()) : [name];
    p.forEach((itm) => {
      if (!options.includes(itm)) { options.push(itm); }
      if (itm.includes(' ')) {
        options.push(itm.replace(' ', '-'));
      }
      if (itm.includes('-')) {
        options.push(itm.replace('-', ' '));
      }
      if (itm.match(/[\s-]/g)) {
        options.push(itm.replace(/[\s-]/g, ''));
      }
    });
    return options;
  }

  /**
   * Populates the appropriate text for Swagger documentation based on universe and path
   * getValue is a helper library to access nested objects by dot seperated values
   * @param  {String} key      dot seperated path to key value e.g. base.notes
   * @return {String}          Swagger endpoint documentation
   */
  popText(key) {
    return getValue(this.commonText(), key);
  }

  /**
   * Breaks up Search pattern into recognizable search filter object to processing
   * during filtering stage
   * e.g. spider+man or spider-man,-616
   * @param  {String} characters is the Character search string. See README.md for available options
   * @return {Object}   Object of search option arrays
   */
  searchObj(characters) {
    let chars;
    const sArry = this.handleParamTypes(characters);
    const search = {
      some: [],
      every: [],
      exclude: [],
    };
    sArry.forEach((itm) => {
      if (itm.startsWith('-')) {
        chars = this.permutate(itm.replace('-', ''));
        search.exclude = chars.concat(search.exclude);
      } else if (itm.includes('+')) {
        chars = this.permutate(itm.split('+'));
        search.every = chars.concat(search.every);
      } else {
        chars = this.permutate(itm);
        search.some = chars.concat(search.some);
      }
    });
    return search;
  }

  /**
   * SortObject converts a specially formatted query param into an array of objects
   * s=name,appearances:desc becomes
   * [{
   *  "column": "name",
   *  "sort": 1,
   * }, {
   *  "column": "appearances",
   *  "sort": -1,
   * }]
   * @param  {String} sortStr querystring parameter
   * @return {Array}   Array of objects for sorting on
   */
  sortObj(sortStr) {
    const sort = [];
    const sortArry = this.handleParamTypes(sortStr);
    sortArry.forEach((itm) => {
      if (this.isStr(itm) && itm.includes(':')) {
        const t = itm.split(':');
        sort.push({ column: t[0], sort: this.direction(t[1]) });
      } else if (itm.sort) {
        // eslint-disable-next-line no-param-reassign
        itm.sort = this.direction(itm.sort);
        sort.push(itm);
      } else {
        sort.push({ column: itm, sort: 1 });
      }
    });
    return sort;
  }

  /**
   * Hapi Endpoint Valiation Object. Makes sure data being passed in is
   * what we expect it to be and in the format we expect it in
   * @param  {Array} validParams Array of Query, Paramerter or Payload parameters to validate
   * @param  {String} method     get or post - depending on method, what kind of validation
   *                             should be first
   * @return {Object}            Joi validation object
   */
  validateParams(validParams, method) {
    let params = Joi.object().keys({
      format: Joi.string()
        .optional()
        .valid('json'),
    });
    const tfText = 'No default value is required, presence equates to true';
    const commaSepRegEx = /([a-zA-Z0-9_]+)(,[a-zA-Z0-9_]+)*/;
    /**
      There is a limitation with Hapi Swagger where alternatives (the validation of multiple
      kinds of parameterized data) is not accurately represented within the Swagger UI. The
      UI takes whatever the first entry is and ignores the rest. This is only an issue where
      I want to distinguish differences between GET and POST methods On GET methods, I
      want the String to be defaulted first, on POST Array should be the default.
      It's a small detail but one I think is worth the extra effort
    */

    if (validParams.includes('characters')) {
      const str = Joi.string()
        .description('Character(s) to search for')
        .label('String')
        .optional()
        .regex(commaSepRegEx);
      const arryStr = Joi.string()
        .label('characters: characters');
      const arry = Joi.array()
        .description('Character(s) to search for. Either a string or Array of strings')
        .items(arryStr)
        .label('characters: array of characters');

      const c = (method === 'post') ? Joi.alternatives().try(arry, arryStr) : Joi.alternatives().try(str);
      params = params.append({
        characters: c.description('Character(s) to search for. Either a string or Array of strings'),
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
            .valid(this.columns),
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
          .default(this.limit)
          .description('Limit result set. \'0\' for no limit')
          .integer()
          .min(0)
          .optional(),
      });
    }

    if (validParams.includes('nulls')) {
      params = params.append({
        nulls: Joi.boolean()
          .allow('')
          .description(`Sort null values first or last in order. ${tfText}`)
          .optional()
          .valid('first', 'last'),
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

    if (validParams.includes('prune')) {
      params = params.append({
        prune: Joi.boolean()
          .allow('')
          .description(`Remove keys with null values. ${tfText}`)
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
        column: Joi.required().valid(this.columns),
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
  }
}

module.exports = {
  ApiUtils,
};
