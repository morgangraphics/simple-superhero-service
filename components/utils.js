
/**
 * Internal Helper function to convert asc|desc to numeric value
 * @param  {String} val asc or desc
 * @return {Number}     numeric representation of asc (1) or desc (-1))
 */
const _direction = val => ((val === 'asc') ? 1 : -1);

/**
 * Quick helper to determine if something is a string
 * @param  {String}  str String to test
 * @return {Boolean}     If String is True|False
 */
const isStr = str => (str instanceof String) || typeof (str) === 'string';

/**
 * Parameters can come in several different formats. This private method
 * tests for the format and prepares it accordingly
 * @param  {String|Object|Array} param parameter sent to endpoint
 * @return {Array}       Array of parametes for further processing
 */
const _handleParamTypes = (param) => {
  let response;
  if (isStr(param)) {
    response = param.split(',');
  } else if (param instanceof Array) {
    response = param;
  } else if (param instanceof Object) {
    response = [param];
  }
  return response;
};

/**
 * Will attempt to make perumtations on names passed in so empty result sets are limited
 * e.g. spider man, spider-man, spiderman
 * @param  {String} name name of the character you are searching for
 * @return {Array}      Array of perumations
 */
const permutate = (name) => {
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
};

/**
 * Breaks up Search pattern into recognizable search filter object to processing
 * during filtering stage
 * e.g. spider+man or spider-man,-616
 * @param  {String} c is the Character search string. See README.md for available options
 * @return {Object}   Object of search option arrays
 */
const searchObj = (c) => {
  let chars;
  const sArry = _handleParamTypes(c);
  const search = {
    some: [],
    every: [],
    exclude: [],
  };
  sArry.forEach((itm) => {
    if (itm.startsWith('-')) {
      chars = permutate(itm.replace('-', ''));
      search.exclude = chars.concat(search.exclude);
    } else if (itm.includes('+')) {
      chars = permutate(itm.split('+'));
      search.every = chars.concat(search.every);
    } else {
      chars = permutate(itm);
      search.some = chars.concat(search.some);
    }
  });
  return search;
};

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
 * @param  {String} s querystring parameter
 * @return {Array}   Array of objects for sorting on
 */
const sortObj = (s) => {
  const sort = [];
  const sortArry = _handleParamTypes(s);
  sortArry.forEach((itm) => {
    if (isStr(itm) && itm.includes(':')) {
      const t = itm.split(':');
      sort.push({ column: t[0], sort: _direction(t[1]) });
    } else if (itm.sort) {
      // eslint-disable-next-line no-param-reassign
      itm.sort = _direction(itm.sort);
      sort.push(itm);
    } else {
      sort.push({ column: itm, sort: 1 });
    }
  });
  return sort;
};


module.exports = {
  isStr,
  searchObj,
  sortObj,
};
