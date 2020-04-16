/**
 * Store result sets
 * @type {Object}
 */
const cache = {
  dc: [],
  marvel: [],
  search: [],
};

/**
 * Character data files
 * @type {Object}
 */
const characters = {
  dc: 'dc-wikia-data_csv.csv',
  marvel: 'marvel-wikia-data_csv.csv',
};

/**
 * Available columns from dataset
 * @type {Array}
 */
const columns = ['name', 'page_id', 'urlslug', 'id', 'align', 'eye', 'hair', 'sex',
  'gsm', 'alive', 'appearances', 'first appearance', 'year'];

/**
 * Parameters needed for Swagger Documentation. It differes slightly by Universe
 * @type {Object}
 */
const docParams = {
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
 * Seed needed for randomization freezing
 * @type {Array}
 */
const seed = 999111;

/**
 * Allowed filters per Base endpoint
 * @type {Array}
 */
const validBaseQParams = ['character', 'format', 'h', 'help', 'limit', 'pretty', 'random', 's', 'seed'];

/**
 * Allowed Filters per Character endpoint
 * @type {Array}
 */
const validCharQParams = ['character', 'format', 'h', 'help', 'limit', 'pretty', 's'];


module.exports = {
  cache,
  characters,
  columns,
  docParams,
  seed,
  validBaseQParams,
  validCharQParams,
};
