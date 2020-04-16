const Chance = require('chance');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const firstBy = require('thenby');

const common = require('../api/_common');

let config;
let universe;


/**
 * Filter handles Limits, Randomness, Sorting and Post Limits Munging if needed
 *
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
 * @return {Array} Returns an array of objects
 */
const _filterData = () => {
  if (common.cache.search.length > 0) { common.cache.search = []; }
  const chance = (config.seed) ? new Chance(common.seed) : new Chance();
  const dataInPlay = (config.character) ? common.cache.search : common.cache[universe];
  let results = [];

  if (config.character) {
    const s = config.character.some;
    const e = config.character.every;
    const x = config.character.exclude;
    common.cache[universe].forEach((itm) => {
      // See above for explination
      if (((s.length > 0 && s.some(str => itm.name.includes(str)))
            || (e.length > 0 && e.every(str => itm.name.includes(str))))
         && !x.some(str => itm.name.includes(str))) {
        common.cache.search.push(itm);
      }
    });
  }

  // https://github.com/chancejs/chancejs
  const limit = (config.limit && config.limit !== 0) ? config.limit : 0;
  if (limit > 0 && config.random) {
    const uniques = chance.unique(chance.natural, limit,
      { min: 0, max: common.cache[universe].length });
    uniques.forEach(indx => results.push(common.cache[universe][indx]));
  } else if (limit > 0 && !config.random) {
    results = dataInPlay.slice(0, limit);
  } else if (limit === 0) {
    results = dataInPlay;
  }

  // SORTING - https://github.com/Teun/thenBy.js
  if (config.s) {
    // The first entry in the array will always the the first solumn we sort on
    let srt = firstBy(config.s[0].column, { direction: config.s[0].sort });
    // If there are more than one item then we dynamically sort on those
    for (let i = 1; i < config.s.length; i += 1) {
      srt = srt.thenBy(config.s[i].column, { direction: config.s[i].sort });
    }
    results.sort(srt);
  }

  // MUNGING
  // results.forEach((itm, i) => { results[i].name = itm.name.replace(/\\/g, ''); });

  return results;
};

/**
 * getData streams response from csv file and limits headers, converts/maps values
 * from string to integers as well as unescape some weirdness with quotes and backslashes
 * in some fields. It's really expensive
 * @param  {String} unvrs Comic Universe (DC or Marvel)
 * @param  {Object} cfg   Configuration Object
 * @return {Promise}      Promise object of results
 */
const _getData = (unvrs, cfg) => {
  config = cfg;
  universe = unvrs;
  if (!common.characters[universe]) {
    throw new Error('Invalid universe file');
  } else {
    return new Promise((resolve, reject) => {
      common.cache[universe] = [];
      fs.createReadStream(path.join(__dirname, '..', 'files', common.characters[universe]))
        // .pipe(convertCSVTo)
        .pipe(csv({
          mapHeaders: ({ header }) => (
            config.h && !config.h.includes(header) ? null : header
          ),
          // MapValues iterates over every value in every response which makes it
          // prohibitively expensive for filtering. Make sure you target what you are
          // looking for
          mapValues: ({ header, value }) => {
            if (['page_id', 'appearances', 'year'].includes(header)) {
              // eslint-disable-next-line no-param-reassign
              value = parseInt(value, 10);
            } else if (['name', 'urlslug'].includes(header) && ['"', '/'].some(str => value.includes(str))) {
              // eslint-disable-next-line no-param-reassign
              value = value.replace(/\\/g, '');
            }
            return value;
          },
        }))
        .on('data', (data) => { common.cache[universe].push(data); })
        .on('error', () => reject())
        .on('end', () => resolve(_filterData()));
    }).then(response => response);
  }
};

/**
 * Stub - Only "publically" available method for getting data
 * @param  {String} unvrs Comic Universe (DC or Marvel)
 * @param  {Object} cfg   Configuration Object
 * @return {Promise}      Promise object of results
 */
const readFile = (unvrs, cfg) => _getData(unvrs, cfg);

module.exports = {
  readFile,
};
