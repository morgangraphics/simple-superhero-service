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
 * Allowed filters per Base endpoint
 * @type {Array}
 */
const validBaseQParams = ['characters', 'format', 'h', 'help', 'limit', 'nulls', 'pretty', 'prune', 'random', 's', 'seed'];

/**
 * Allowed Filters per Character endpoint
 * @type {Array}
 */
const validCharQParams = ['characters', 'format', 'h', 'help', 'limit', 'nulls', 'pretty', 'prune', 's'];

/**
 * GLobal Variable declared for x-simple-superhero-service header
 */
const VERSION = process.env.npm_package_version;

/**
 * Quick and dirty Deep Copy function
 * @param {Object} data Object we want to copy
 * @returns {Object} deep copy of Object
 */
function copy(data) {
    return JSON.parse(JSON.stringify(data));
}

module.exports = {
    cache,
    copy,
    validBaseQParams,
    validCharQParams,
    VERSION,
};
