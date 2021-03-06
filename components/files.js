const Chance = require('chance');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const firstBy = require('thenby');

const common = require('../api/_common');

/**
 * Class surrounding API scaffolding and common API specific functionality
 */
class FileUtils {
  /**
   * Sets some basic Class based variables
   * @param {String} universe comic book character universe
   */
  constructor(universe) {
    /**
     * Character data files
     * @type {Object}
     */
    this.characters = {
      dc: 'dc-wikia-data_csv.csv',
      marvel: 'marvel-wikia-data_csv.csv',
    };
    /**
     * Configuration options
     * @type {String}
     */
    this.config = '';
    /**
     * buffr is an attempt help reduce the number of overlaps on multiple requests by generating
     * a unique list form a larger pool of numbers
     * @type {Number}
     */
    this.limit_buffer = 200;
    /**
     * Seed needed for randomization freezing
     * @type {Int}
     */
    this.seed = 999111;
    /**
     * Total Data needed to determine buffer upper limit
     * @type {Number}
     */
    this.total_data = 0;
    /**
     * Character universe
     * @type {[type]}
     */
    this.universe = universe;
  } // End Constructor

  /**
   * Filter character based on search critera passed in
   * in if (config.character)  section:
   *
   * const s = ['superman', 'super man', 'super-man']
   * const e = ['super', 'man']
   * If s.length > 0 and item.name includes any entry in s
   * OR
   * If e.length > 0 and item.name includes any entry in e
   * AND
   * Doesn't contain any exclusions
   * add to search array
   *
   * @return {Array} Of matching characters
   */
  filterCharacters() {
    const dataInPlay = [];
    const s = this.config.characters.some;
    const e = this.config.characters.every;
    const x = this.config.characters.exclude;
    common.cache[this.universe].forEach(itm => {
      // See above for explanation
      if (((s.length > 0 && s.some(str => itm.name.includes(str)))
            || (e.length > 0 && e.every(str => itm.name.includes(str))))
         && !x.some(str => itm.name.includes(str))) {
        dataInPlay.push(itm);
      }
    });
    return dataInPlay;
  }

  /**
   * FilteDatar handles Limits, Randomness, Sorting and Post Limits Munging if needed
   *
   * @return {Array} Returns an array of objects
   */
  filterData() {
    let dataInPlay;
    if (common.cache.search.length > 0) { common.cache.search = []; }
    let results;

    // CHARACTERS
    if ('characters' in this.config) {
      dataInPlay = this.filterCharacters();
    } else {
      dataInPlay = common.cache[this.universe];
    }

    // LIMITING
    results = this.filterLimit(dataInPlay);

    // SORTING
    if (this.config.s) {
      results = this.sortResults(results);
    }

    return results;
  }

  /**
   * Once we have met the search criteria, we can begin to pare down the results as needed
   * by applying the limiets
   * @param  {Array} data Array of characters that match search criteria
   * @return {Array} Reduced array based on limits
   */
  filterLimit(data) {
    // https://github.com/chancejs/chancejs
    const chance = (this.config.seed) ? new Chance(this.seed) : new Chance();
    let dataInPlay = [];
    const limit = (this.config.limit && this.config.limit !== 0) ? this.config.limit : 0;

    // buffr is an attempt help reduce the number of overlaps on multiple requests by generating
    // a unique list form a larger pool of numbers
    if (limit > 0 && this.config.random) {
      const buffr = (limit + this.limit_buffer >= this.total_data) ? limit
        : (limit + this.limit_buffer);
      const uniques = chance.unique(chance.natural, limit,
        { min: 0, max: buffr });
      uniques.forEach(indx => dataInPlay.push(common.cache[this.universe][indx]));
    } else if (limit > 0 && !this.config.random) {
      dataInPlay = data.slice(0, limit);
    } else if (limit === 0) {
      dataInPlay = data;
    }
    return dataInPlay;
  }

  /**
   * This method will open the correct file and
   * 1. Optional: Show only the Columns/Headers Requested
   * 2. Coerce data types to the correct type
   * 3. Decode Unicode escaped/encoded values e.g. \u00c4kr\u00e4s to Äkräs
   * 4. Strip out the double // in the Name and UrlSlug columns
   * 5. Coerce empty values "" to null
   * 6. Optional: Prune all null values
   * 7. Ensure that row is removed if sorting and prune are defined and sorting key is null
   * 8. Pass to Filter function which will data set based on parameters passed in
   * @return {Promise}      Promise List of Comic Characters which meet the requirements
   */
  getData() {
    if (!this.characters[this.universe]) {
      throw new Error('Invalid universe file');
    } else {
      return new Promise((resolve, reject) => {
        common.cache[this.universe] = [];
        fs.createReadStream(path.join(__dirname, '..', 'files', this.characters[this.universe]))
          // .pipe(convertCSVTo)
          .pipe(csv({
            mapHeaders: ({ header }) => (
              this.config.h && !this.config.h.includes(header) ? null : header
            ),
            // MapValues iterates over every value in every response which makes it
            // prohibitively expensive for filtering. Make sure you target what you are
            // looking for
            mapValues: ({ header, value }) => {
              if (['page_id', 'appearances', 'year'].includes(header)) {
                // eslint-disable-next-line no-param-reassign
                value = parseInt(value, 10);
              }

              // this will take a unicode_escaped string e.g. \u00c4kr\u00e4s and
              // convert it to the proper encoding e.g. Äkräs
              if (['name'].includes(header) && value.includes('\\u')) {
                // eslint-disable-next-line no-param-reassign
                value = value.replace(/\\u[\dA-F]{4}/gi,
                  match => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))).toLowerCase();
              }

              if (['name', 'urlslug'].includes(header) && ['"', '/'].some(str => value.includes(str))) {
                // eslint-disable-next-line no-param-reassign
                value = value.replace(/\\/g, '');
              }
              // Will convert empty values to null
              if (!value) {
                // eslint-disable-next-line no-param-reassign
                value = null;
              }
              // Returns nothing is prune is true and value is null
              if (this.config.prune && value === null) { return; }

              // eslint-disable-next-line consistent-return
              return value;
            },
          }))
          .on('data', data => {
            // if prune is set and we are sorting, we have to ensure
            // the object have all the keys with valid values (no null) to sort on
            if ('prune' in this.config && 's' in this.config) {
              const curKz = Object.keys(data);
              const sortOn = this.config.s.reduce((r, k) => r.concat(k.column), []);
              if (sortOn.every(itm => curKz.includes(itm))) {
                common.cache[this.universe].push(data);
              }
            } else {
              common.cache[this.universe].push(data);
            }
          })
          .on('error', () => reject())
          .on('end', () => {
            // We set total_data to ensure buffr doesn't exceed the upper limit
            this.total_data = common.cache[this.universe].length;
            resolve(this.filterData());
          });
      }).then(response => response);
    }
  }

  /**
   * Entrypoint for retreiving data
   * @param  {Object} config   Configuration Object
   * @return {Promise}      Promise object of results
   */
  readCharacterFile(config) {
    this.config = config;
    return this.getData();
  }

  /**
   * Custom sorting function that allows for sorting null while also maintaining
   * locale aware sorting config["nulls"] will allow for sorting null and putting
   * them at the front or end of the array
   * l = [1, 3, 2, 5, 4, null, 7]
   * console.log('Last = ', sort_results(l)) e.g nulls=last
   * Last = [1, 2, 3, 4, 5, 7, null]
   * console.log('First = ', sort_results(l)) e.g nulls=first
   * First = [null, 1, 2, 3, 4, 5, 7]
   * @param  {Array} results Array of remaining characters that survived other filters
   * @return {Array} Sorted array of JSON objects based on criteria
   */
  sortResults(results) {
    // https://github.com/Teun/thenBy.js
    // The first entry in the array will always the the first solumn we sort on
    let srt = firstBy(this.config.s[0].column,
      { cmp: this.sortIl8nStr.bind(this), direction: this.config.s[0].sort });
    // console.log('srt 1 = ', results.slice().sort(srt).slice(0, 3));
    // If there are more than one item then we dynamically sort on those
    for (let i = 1; i < this.config.s.length; i += 1) {
      srt = srt.thenBy(this.config.s[i].column,
        { cmp: this.sortIl8nStr.bind(this), direction: this.config.s[i].sort });
      // console.log('srt 2 = ', results.slice().sort(srt).slice(0, 3));
    }
    return results.sort(srt);
  }

  /**
   * Sorting compare function to handle
   * @param  {?String|?Number} a comparitor
   * @param  {?String|?Number} b comparitor
   * @return {Object}   Sorted Object
   */
  sortIl8nStr(a, b) {
    // console.log('a = ', a, 'b = ', b);
    if (this.config.nulls === 'first') {
      // console.log('here ', a, b)
      // Compare if values are empty/null/undefined
      if (!a && b) {
        return 1;
      }
      if (!b && a) {
        return -1;
      }
    } else {
      if (!a && b) {
        return -1;
      }
      if (!b && a) {
        return 1;
      }
    }
    // Are values a number? Test for equality or test if they are not equal
    if (Number.isInteger(a) && Number.isInteger(b)) {
      // equal items sort equally
      if (parseInt(a, 10) === parseInt(b, 10)) {
        return 0;
      }
      return parseInt(a, 10) > parseInt(b, 10) ? 1 : -1;
    }
    if (Number.isInteger(a)) {
      return -1;
    }
    if (Number.isInteger(b)) {
      return 1;
    }
    // equal items sort equally
    if (a === b) {
      return 0;
    }
    return a.localeCompare(b, 'en', { ignorePunctuation: true });
  }
}

module.exports = {
  FileUtils,
};
