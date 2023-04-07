const Chance = require('chance');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const firstBy = require('thenby');
const dcs = require('diacritics');

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
     * if prune = true
     * AND
     * some sort value is passed in e.g.
     * s: [{
     *       column: 'sex',
     *       sort: 1
     *  }]
     * we can force the sort value to have value that is not null
     * @type {Bool}
     */
        this.allow_null_on_sort = false;
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
     * buffer is an attempt help reduce the number of overlaps on multiple requests by generating
     * a unique list form a larger pool of numbers
     * @type {Number}
     */
        this.limit_buffer = (universe === 'marvel') ? 16376 : 6896;
        /**
     * Seed needed for randomization freezing
     * @type {Int}
     */
        this.seed = 999111;
        /**
     * Character universe
     * @type {[type]}
     */
        this.universe = universe;
    } // End Constructor

    #sortIndex = 0;

    /**
   * Filter character based on search critera passed in
   * in if (config.character)  section:
   *
   * const s = ['superman', 'super man', 'super-man']
   * const e = ['super', 'man']
   * const x = ["bat"]
   *
   * If s.length > 0 and item.name includes any entry in s
   * OR
   * If e.length > 0 and item.name includes every entry in e
   * AND
   * Doesn't contain anything in x
   *
   * OR
   * Doesn't contain anything in x
   *
   * Then add to search array
   *
   * Diacritic safe search (tefe === tefé) however, (tefé !== tefe)
   * If name includes any diacritic characters e.g. Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ ą ć ę ł ń ó ś ź ż ä ö ü ß
   * Convert them to their Latin equivalent, ensure that all entries are unique (Set)
   * and search for matches
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
            // Deep copy of object to prevnt issues down the road
            const citm = common.copy(itm);
            const sa = new Set([citm.name, dcs.remove(citm.name)]);
            if (((s.length > 0 && s.some(sitm => [...sa].some(subitm => subitm.includes(sitm))))
            || (e.length > 0 && e.every(eitm => [...sa].every(subitm => subitm.includes(eitm)))))
         && !x.some(xitm => [...sa].some(subitm => subitm.includes(xitm)))) {
                dataInPlay.push(citm);
            } else if ((s.length === 0 && e.length === 0)
                       && !x.some(xitm => [...sa].some(subitm => subitm.includes(xitm)))) {
                dataInPlay.push(citm);
            }
        });

        return dataInPlay;
    }

    /**
   * FilteData handles Limits, Randomness, Sorting and Post Limits Munging if needed
   *
   * @return {Array} Returns an array of objects
   */
    filterData() {
        let dataInPlay;
        let results = [];

        // CHARACTERS
        if ('characters' in this.config) {
            dataInPlay = this.filterCharacters();
        } else {
            dataInPlay = common.copy(common.cache[this.universe]);
        }

        // SORTING
        if (this.config.s) {
            results = this.sortResults(dataInPlay);
        }

        // PRUNING
        if (this.config.prune) {
            results = this.pruneData((results.length > 0) ? results : dataInPlay);
        }

        // LIMITING
        results = this.filterLimit((results.length > 0) ? results : dataInPlay);

        return results;
    }

    /**
   * Once we have met the search criteria, we can begin to pare down the results as needed
   * by applying the limits
   * @param  {Array} data Array of characters that match search criteria
   * @return {Array} Reduced array based on limits
   */
    filterLimit(data) {
    // https://github.com/chancejs/chancejs
        const chance = (this.config.seed) ? new Chance(this.seed) : new Chance();
        let dataInPlay = [];

        if (this.config.limit >= 0) {
            if (this.config.limit > 0 && this.config.random) {
                if (this.config.limit > data.length) {
                    const limit = data.length;
                    const uniques = chance.unique(
                        chance.natural,
                        limit,
                        { min: 0, max: limit - 1 },
                    );
                    // eslint-disable-next-line security/detect-object-injection
                    uniques.forEach(indx => dataInPlay.push(data[indx]));
                }
                if (this.config.limit <= data.length) {
                    const { limit } = this.config;
                    const uniques = chance.unique(
                        chance.natural,
                        limit,
                        { min: 0, max: limit },
                    );
                    // eslint-disable-next-line security/detect-object-injection
                    uniques.forEach(indx => dataInPlay.push(common.cache[this.universe][indx]));
                }
            }
            if (this.config.limit > 0 && !this.config.random) {
                if (this.config.limit > data.length) {
                    dataInPlay = data.slice(0, data.length);
                }
                if (this.config.limit <= data.length) {
                    dataInPlay = data.slice(0, this.config.limit);
                }
            }
            if (this.config.limit === 0) {
                dataInPlay = data;
            }
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
                const filePath = path.join(__dirname, '..', 'files', this.characters[this.universe]);
                // const filePath = path.join(__dirname, '..', 'files/test.csv');
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.createReadStream(filePath)
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
                                value = value.replace(
                                    /\\u[\dA-F]{4}/gi,
                                    match => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)),
                                ).toLowerCase();
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
                            // if (this.config.prune && value === null) { return; }

                            // eslint-disable-next-line consistent-return
                            return value;
                        },
                    }))
                    .on('data', data => common.cache[this.universe].push(data))
                    .on('error', () => reject())
                    .on('end', () => {
                        resolve(this.filterData());
                    });
            }).then(response => response);
        }
    }

    /**
   * Prune data function will remove the null value keys if prune = true
   * If this.allow_null_on_sort is true, null values for keys that are being sorted on
   * will be kept with the null value
   * @param {Array} data    Array of sorted charcater objects
   * @return {Array}        Array of pruned objects
   */
    pruneData(data) {
    // if (this.config?.prune != false  && 's' in this.config) {
        const dataInPlay = [];
        const sortOn = this.config?.s?.reduce((r, k) => r.concat(k.column), []) || [];

        data.forEach(itm => {
            const curKz = Object.keys(itm);

            if (this.allow_null_on_sort && sortOn.every(sortItm => curKz.includes(sortItm))) {
                // Keep null sort key/value(s) but remove any other null key/value
                curKz.forEach(key => {
                    // eslint-disable-next-line no-param-reassign, security/detect-object-injection
                    if (!itm[key] && !sortOn.includes(key)) { delete itm[key]; }
                });
            } else if (!this.allow_null_on_sort
                    && sortOn.every(sortItm => curKz.includes(sortItm)
                    && itm[sortItm] !== undefined)) {
                // Ensure that the sort value has a non-null value AND Remove all null values
                curKz.forEach(key => {
                    // eslint-disable-next-line no-param-reassign, security/detect-object-injection
                    if (!itm[key]) { delete itm[key]; }
                });
            }
            dataInPlay.push(itm);
        });

        return dataInPlay;
    }

    /**
   * Entrypoint for retreiving data
   * @param  {Object} config   Configuration Object
   * @return {Promise}         Promise object of results
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
   * @param  {Array} data Array of remaining characters that survived other filters
   * @return {Array} Sorted array of JSON objects based on criteria
   */
    sortResults(data) {
    // https://github.com/Teun/thenBy.js
    // The first entry in the array will always the the first solumn we sort on
        const results = common.copy(data);
        this.#sortIndex = 0;
        let srt = firstBy(
            this.config.s[0].column,
            { cmp: this.sortIl8nStr.bind(this), direction: this.config.s[0].sort },
        );
        results.sort(srt);

        // If there are more than one item then we dynamically sort on those
        for (let i = 1; i < this.config.s.length; i += 1) {
            this.#sortIndex = i;
            srt = srt.thenBy(
                this.config.s[this.#sortIndex].column,
                {
                    cmp: this.sortIl8nStr.bind(this),
                    direction: this.config.s[this.#sortIndex].sort,
                },
            );
        }

        return results;
    }

    /**
   * Sorting compare function to handle
   * Null sorting, when used in conbination with thenBy, will produce some inconsistent results if
   * sorting direction is not taken into account. If nulls: first and sort desc, nulls would show
   * up last instead of first.
   * this.#sortIndex is an internal placedolder when dealing with multiple
   * sort options
   * @param  {?String|?Number} a comparitor
   * @param  {?String|?Number} b comparitor
   * @return {Object}   Sorted Object
   */
    sortIl8nStr(a, b) {
        if (((this.config.nulls === 'first') && (this.config.s[this.#sortIndex]?.sort === -1))
        || ((this.config.nulls === 'last') && (this.config.s[this.#sortIndex]?.sort === 1))) {
            // Compare if values are empty/null/undefined
            if (!a && b) {
                return 1;
            }
            if (!b && a) {
                return -1;
            }
        }
        if (((this.config.nulls === 'first') && (this.config.s[this.#sortIndex]?.sort === 1))
        || ((this.config.nulls === 'last') && (this.config.s[this.#sortIndex]?.sort === -1))) {
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
        return a.localeCompare(b, 'en', { sensitivity: 'base', ignorePunctuation: true });
    }
}

module.exports = {
    FileUtils,
};
