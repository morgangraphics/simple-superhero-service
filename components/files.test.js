const common = require('../api/_common');
const file = require('./files');
const resp = require('./files.mock.response.json');

describe('Testing files.js  - Class instaniation', () => {
    const c = new file.FileUtils('marvel');

    test('class instantiated', () => {
        expect(c).toBeInstanceOf(file.FileUtils);
    });

    test('constructor - allow_null_on_sort = false', () => {
        expect(c.allow_null_on_sort).toEqual(false);
    });

    test('constructor - characters object', () => {
        expect(c.characters).toHaveProperty('marvel', 'marvel-wikia-data_csv.csv');
        expect(c.characters).toHaveProperty('dc', 'dc-wikia-data_csv.csv');
    });

    test('constructor - config', () => {
        expect(c.config).toEqual('');
    });

    test('constructor - limit_buffer', () => {
        expect(c.limit_buffer).toEqual(16376);
    });

    test('constructor - seed', () => {
        expect(c.seed).toEqual(999111);
    });

    test('constructor - universe', () => {
        expect(c.universe).toEqual('marvel');
    });

    test('constructor - allow_null_on_sort = true', () => {
        c.allow_null_on_sort = true;
        expect(c.allow_null_on_sort).toEqual(true);
    });
});

describe('method - filterCharacters - Every', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterCharacters - returns only names that contain spider and man', () => {
        const filtered = c.filterCharacters();

        expect(filtered).toHaveProperty('length', 5);
        expect(filtered[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');

        expect(filtered[filtered.length - 1]).toHaveProperty('name', expect.stringContaining('spider'));
        expect(filtered[filtered.length - 1]).toHaveProperty('name', expect.stringContaining('man'));
    });
});

describe('method - filterCharacters - Some', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['spider'],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterCharacters - returns only names that contain spider', () => {
        const filtered = c.filterCharacters();

        expect(filtered).toHaveProperty('length', 5);
        expect(filtered[1]).toHaveProperty('name', 'strongman (spider-squad) (earth-616)');
        expect(filtered[filtered.length - 1]).toHaveProperty('name', expect.stringContaining('spider'));
    });
});

describe('method - filterCharacters - Exclude Only', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: [],
            exclude: ['earth-616'],
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterCharacters - returns only names that exclude earth-616', () => {
        const filtered = c.filterCharacters();

        expect(filtered).toHaveProperty('length', 6);
        expect(filtered[0]).toHaveProperty('name', 'captain america (steven rogers)');
        expect(filtered[filtered.length - 1]).toHaveProperty('name', expect.not.stringContaining('earth-616'));
    });
});

describe('method - filterCharacters - Some w/ Exclude', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['spider'],
            every: [],
            exclude: ['earth-616'],
        },
        format: undefined,
        help: false,
        limit: 50,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterCharacters - returns only names that contain spider excluding earth-616', () => {
        const filtered = c.filterCharacters();

        expect(filtered).toHaveProperty('length', 1);
        expect(filtered[0]).toHaveProperty('name', 'spider-man (peter parker)');
        expect(filtered[0]).toHaveProperty('name', expect.not.stringContaining('earth-616'));
        expect(filtered[0]).toHaveProperty('name', expect.stringContaining('spider'));
    });
});

describe('method - filterData - Sort on year desc', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['ben', 'reed', 'hulk'],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'year',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterData - 3 characters, reverse sorted by year', () => {
        const filteredData = c.filterData();

        const year0 = filteredData[0].year;
        const year1 = filteredData[1].year;
        const year2 = filteredData[2].year;

        expect(filteredData).toHaveProperty('length', 3);
        expect(year0).toBeGreaterThan(year1);
        expect(year1).toEqual(year2);
    });

    test('method - filterData - remove characters config - pull from cache', () => {
        delete c.config.characters;
        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 15);
    });
});

describe('method - filterData - Prune', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        prune: true,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterData - 3 names with spider and man in it, all null key/values removed', () => {
        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 3);

        expect(filteredData[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');
        expect(filteredData[0]).not.toHaveProperty('id');
        expect(filteredData[0]).not.toHaveProperty('align');
        expect(filteredData[0]).not.toHaveProperty('eye');
        expect(filteredData[0]).not.toHaveProperty('hair');
        expect(filteredData[0]).not.toHaveProperty('gsm');
    });
});

describe('method - filterData - Prune w/ nulls & sort', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 10,
        nulls: 'first',
        pretty: false,
        prune: true,
        s: [{
            column: 'align',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterData - 5 names with spider and man in it, all null key/values removed except sort key/value', () => {
        c.allow_null_on_sort = true;

        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 5);

        // Test that prune removed null key/value pairs except key we are sorting on
        expect(filteredData[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');
        expect(filteredData[0]).not.toHaveProperty('id');
        expect(filteredData[0]).toHaveProperty('align', null);
        expect(filteredData[0]).not.toHaveProperty('eye');
        expect(filteredData[0]).not.toHaveProperty('hair');
        expect(filteredData[0]).not.toHaveProperty('gsm');

        // Test that the nulls direction & sort direction are working as expected
        expect(filteredData[filteredData.length - 1]).toHaveProperty('align', 'bad characters');
        expect(filteredData[filteredData.length - 2]).toHaveProperty('align', 'good characters');
    });

    test('method - filterData - nulls first, with sort asc', () => {
        c.allow_null_on_sort = false;
        c.config.s[0].sort = 1;

        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 5);

        // Test that prune removed null key/value pairs except key we are sorting on
        expect(filteredData[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');

        // Test that the nulls direction & sort direction are working as expected
        expect(filteredData[filteredData.length - 1]).toHaveProperty('align', 'good characters');
        expect(filteredData[filteredData.length - 2]).toHaveProperty('align', 'bad characters');
    });

    test('method - filterData - nulls last, with sort desc', () => {
        c.config.nulls = 'last';
        c.config.s[0].sort = -1;

        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 5);

        // Test that prune removed null key/value pairs except key we are sorting on
        expect(filteredData[0]).toHaveProperty('name', 'spider-man (peter parker)');

        // Test that the nulls direction & sort direction are working as expected
        expect(filteredData[0]).toHaveProperty('align', 'good characters');
        expect(filteredData[1]).toHaveProperty('align', 'bad characters');
        expect(filteredData[filteredData.length - 1]).not.toHaveProperty('align');
    });

    test('method - filterData - nulls last, with sort asc', () => {
        c.config.nulls = 'last';
        c.config.s[0].sort = 1;

        const filteredData = c.filterData();

        expect(filteredData).toHaveProperty('length', 5);

        // Test that prune removed null key/value pairs except key we are sorting on
        expect(filteredData[0]).toHaveProperty('name', 'spiderman (1940s) (earth-616)');

        // Test that the nulls direction & sort direction are working as expected
        expect(filteredData[0]).toHaveProperty('align', 'bad characters');
        expect(filteredData[1]).toHaveProperty('align', 'good characters');
        expect(filteredData[filteredData.length - 1]).not.toHaveProperty('align');
    });

    test('method - filterData - without characters', () => {
        delete c.config.characters;
        const filterData = c.filterData();
        expect(filterData).toHaveProperty('length', 10);
    });

    test('method - filterData - with characters - No Sort', () => {
        c.config.characters = {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        };
        delete c.config.s;
        const filterData = c.filterData();
        expect(filterData).toHaveProperty('length', 5);
    });
});

describe('method - filterLimit', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        prune: false,
        random: true,
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - filterLimit - 3 random entries', () => {
        const filterLimit = c.filterLimit(resp);

        expect(filterLimit).toHaveProperty('length', 3);
    });

    test('method - filterLimit - 4 entries', () => {
        c.config.limit = 4;
        c.config.random = false;
        const filterLimit = c.filterLimit(resp);

        expect(filterLimit).toHaveProperty('length', 4);
    });

    test('method - filterLimit - with seed', () => {
        c.config.limit = 4;
        c.config.random = true;
        c.config.seed = true;
        const filterLimit1 = c.filterLimit(resp);
        const filterLimit2 = c.filterLimit(resp);

        const names1 = filterLimit1.reduce((a, v) => a.concat(v.name), []);
        const names2 = filterLimit2.reduce((k, v) => k.concat(v.name), []);

        expect(names1).toEqual(names2);
    });

    test('method - filterLimit - 0 == all entries', () => {
        c.config.limit = 0;
        c.config.random = true;
        const filterLimit = c.filterLimit(resp);

        expect(filterLimit).toHaveProperty('length', 15);
    });
});

describe('method - getData - invalid universe', () => {
    const c = new file.FileUtils('image');
    c.config = {
        characters: {
            some: [],
            every: ['spider', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        prune: false,
        random: true,
        universe: 'image',
    };

    test('method - getData - invalid universe file', async () => {
        await expect(() => { c.getData(); }).toThrow('Invalid universe file');
    });
});

describe('method - getData - testing explicit header passing', () => {
    const c = new file.FileUtils('dc');
    c.config = {
        characters: {
            some: [],
            every: ['bat', 'man'],
            exclude: [],
        },
        format: undefined,
        h: ['name', 'year'],
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        prune: false,
        random: false,
        universe: 'dc',
    };

    test('method - getData - passing in headers', async () => {
        const data = await c.getData();
        expect(Object.keys(data[0])).toEqual(expect.arrayContaining(['name', 'year']));
    });
});

describe('method - getData - valid universe w/ prune, sorting options', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['iron', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 10,
        nulls: 'first',
        pretty: false,
        prune: true,
        random: false,
        s: [{
            column: 'eye',
            sort: -1,
        }],
        universe: 'marvel',
    };

    test('method - getData - pruning - checks to see the sorting thing we are looking for is not null/undefined', async () => {
        const data = await c.getData();
        const hair = Array.from(new Set(data.flatMap(itm => (!itm.hair ? [] : itm.hair))));

        expect(data).toHaveProperty('length', 7);

        expect(data[0]).not.toHaveProperty('gsm');
        expect(Object.keys(data[0])).toEqual(expect.arrayContaining(['page_id', 'name', 'urlslug', 'align', 'hair', 'sex', 'alive', 'appearances', 'first appearance', 'year']));

        expect(data[2]).not.toHaveProperty('eye');
        expect(data[2]).not.toHaveProperty('align');

        expect(hair).toHaveProperty('length', 3);
    });
});

describe('method - getData - valid marvel universe', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 0,
        nulls: 'first',
        pretty: false,
        prune: false,
        universe: 'marvel',
    };

    test('method - getData - marvel', async () => {
        const data = await c.getData();
        expect(data).toHaveProperty('length', 16376);
    });

    test('method - getData - marvel w/ random', async () => {
        c.config.random = true;
        const data = await c.getData();

        expect(data).toHaveProperty('length', 16376);
    });
});

describe('method - getData - valid dc universe', () => {
    const c = new file.FileUtils('dc');
    c.config = {
        characters: {
            some: [],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 0,
        nulls: 'first',
        pretty: false,
        prune: false,
        universe: 'dc',
    };

    test('method - getData - dc', async () => {
        const data = await c.getData();
        expect(data).toHaveProperty('length', 6896);
    });
});

describe('method - getData - valid universe w/ prune AND random', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: [],
            every: ['ralph', 'man'],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 10,
        nulls: 'first',
        pretty: false,
        prune: true,
        random: true,
        s: [{
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    test('method - getData - pruning - checks to see the sorting thing we are looking for is not null/undefined', async () => {
        const data = await c.getData();

        const namesExpected = ['ralph (spider-woman character) (earth-616)', 'ralph brickman (earth-616)'];
        const names = data.reduce((r, k) => r.concat(k.name), []);

        expect(names).toEqual(expect.arrayContaining(namesExpected));
    });
});

describe('method - readCharacerFile', () => {
    const c = new file.FileUtils('marvel');
    const config = {
        characters: {
            some: [],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        universe: 'marvel',
    };

    test('method - readCharacterFile - marvel', async () => {
        const data = await c.readCharacterFile(config);
        expect(data).toHaveProperty('length', 100);
    });
});

describe('method - sortResults', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['ben', 'reed', 'hulk'],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [{
            column: 'year',
            sort: 1,
        }, {
            column: 'name',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // We are just sorting on the mocked response file.
    test('method - sortResults - year asc, name desc', () => {
        const sortedData = c.sortResults(resp);

        const rrIdx = sortedData.findIndex(itm => itm.name === 'reed richards (earth-616)');
        const bgIdx = sortedData.findIndex(itm => itm.name === 'benjamin grimm (earth-616)');
        const jsIdx = sortedData.findIndex(itm => itm.name === 'jonathan storm (earth-616)');

        expect(rrIdx).toBe(3);
        expect(bgIdx).toBe(4);
        expect(jsIdx).toBe(5);
    });
});

describe('method - sortResults', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['ben', 'reed', 'hulk'],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'last',
        pretty: false,
        prune: false,
        s: [{
            column: 'appearances',
            sort: -1,
        }],
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - sortResults - nulls last', () => {
        const sortedData = c.sortResults(resp);
        expect(sortedData[sortedData.length - 1]).toHaveProperty('name', 'ralph (spider-woman character) (earth-616)');
        expect(sortedData[sortedData.length - 1]).toHaveProperty('appearances', null);
    });

    test('method - sortResults - nulls first', () => {
        c.config.nulls = 'first';
        const sortedData = c.sortResults(resp);
        expect(sortedData[0]).toHaveProperty('name', 'ralph (spider-woman character) (earth-616)');
        expect(sortedData[0]).toHaveProperty('appearances', null);
    });
});

describe('method - sortIl8nStr', () => {
    const c = new file.FileUtils('marvel');
    c.config = {
        characters: {
            some: ['vern', 'strongman', 'susan'],
            every: [],
            exclude: [],
        },
        format: undefined,
        help: false,
        limit: 3,
        nulls: 'first',
        pretty: false,
        s: [{
            column: 'sex',
            sort: 1,
        }],
        prune: false,
        universe: 'marvel',
    };

    // mocked response
    common.cache.marvel = resp;

    test('method - sortIl8nStr - numbers, strings - nulls:first', () => {
        const numbers = [1, 100, null, 3, 873, 33.2, 102, 2, null];
        const strings = ['Aplha', 'beta', 'Äkräs', 'Box', null, 'AAron', 'Akira'];

        const sortedNumbers = numbers.sort(c.sortIl8nStr.bind(c));
        const sortedStrings = strings.sort(c.sortIl8nStr.bind(c));

        const expectedNumbers = [null, null, 1, 2, 3, 100, 102, 873, 33.2];
        const expectedStrings = [null, 'AAron', 'Akira', 'Äkräs', 'Aplha', 'beta', 'Box'];

        sortedNumbers.forEach((num, idx) => {
            // eslint-disable-next-line security/detect-object-injection
            expect(num).toStrictEqual(expectedNumbers[idx]);
        });

        sortedStrings.forEach((str, idx) => {
            // eslint-disable-next-line security/detect-object-injection
            expect(str).toStrictEqual(expectedStrings[idx]);
        });
    });

    test('method - sortIl8nStr - numbers, strings - nulls:last', () => {
        c.config.nulls = 'last';

        const numbers = [1, 100, null, 3, 873, 33.2, 102, 2, null];
        const strings = ['Aplha', 'beta', 'Äkräs', 'Box', null, 'AAron', 'Akira'];

        const sortedNumbers = numbers.sort(c.sortIl8nStr.bind(c));
        const sortedStrings = strings.sort(c.sortIl8nStr.bind(c));

        const expectedNumbers = [1, 2, 3, 100, 102, 873, 33.2, null, null];
        const expectedStrings = ['AAron', 'Akira', 'Äkräs', 'Aplha', 'beta', 'Box', null];

        sortedNumbers.forEach((num, idx) => {
            // eslint-disable-next-line security/detect-object-injection
            expect(num).toStrictEqual(expectedNumbers[idx]);
        });

        sortedStrings.forEach((str, idx) => {
            // eslint-disable-next-line security/detect-object-injection
            expect(str).toStrictEqual(expectedStrings[idx]);
        });
    });

    test('method - sortResults - nulls first', () => {
        c.config.nulls = 'first';
        const sortedData = c.sortResults(resp);
        expect(sortedData[0]).toHaveProperty('name', 'strongman (spider-squad) (earth-616)');
        expect(sortedData[0]).toHaveProperty('sex', null);
    });
});
