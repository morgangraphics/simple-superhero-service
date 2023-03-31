const api = require('./api');

describe('Testing api.js  - Class instaniation Marvel', () => {
    const c = new api.ApiUtils('marvel');

    test('class instantiated', () => {
        expect(c).toBeInstanceOf(api.ApiUtils);
    });

    test('constructor - columns/headers', () => {
        expect(c.columns).toEqual(expect.arrayContaining(['name', 'page_id', 'urlslug', 'id', 'align', 'eye', 'hair', 'sex', 'gsm', 'alive', 'appearances', 'first appearance', 'year']));
    });

    test('constructor - docParams object', () => {
        expect(c.docParams).toHaveProperty('marvel');
        expect(c.docParams).toHaveProperty('marvel.display', 'Marvel');
        expect(c.docParams).toHaveProperty('marvel.characters', ['iron man', 'spider-man']);
        expect(c.docParams).toHaveProperty('marvel.search', ['spider', 'man']);
        expect(c.docParams).toHaveProperty('marvel.exclude', 'earth-616');

        expect(c.docParams).toHaveProperty('dc');
        expect(c.docParams).toHaveProperty('dc.display', 'DC');
        expect(c.docParams).toHaveProperty('dc.characters', ['superman', 'batman']);
        expect(c.docParams).toHaveProperty('dc.search', ['bat', 'man']);
        expect(c.docParams).toHaveProperty('dc.exclude', '-woman');
    });

    test('constructor - helpBase', () => {
        expect(c.helpBase).toEqual(expect.stringContaining('format'));
        expect(c.helpBase).toEqual(expect.stringContaining('name'));
    });

    test('constructor - limit', () => {
        expect(c.limit).toEqual(100);
    });

    test('constructor - searchExtended', () => {
        expect(c.srchExtended).toEqual(expect.stringContaining('spider'));
        expect(c.srchExtended).toEqual(expect.stringContaining('year'));
    });

    test('constructor - universe', () => {
        expect(c.universe).toEqual('marvel');
    });
});

describe('Testing api.js - Class instaniation DC', () => {
    test('class instantiated - dc', () => {
        const c = new api.ApiUtils('dc');
        expect(c.universe).toEqual('dc');
    });
});

describe('Testing api.js - Class instaniation DarkHorse', () => {
    test('class instantiated - darkhorse', () => {
        const c = new api.ApiUtils('darkhorse');
        expect(c.universe).toEqual('darkhorse');
    });
});

describe('method - helpSearch() Marvel', () => {
    test('Character Search is renderend differently - Marvel', () => {
        const c = new api.ApiUtils('marvel');
        expect(c.helpSearch()).toEqual(expect.stringContaining('iron man'));
        expect(c.helpSearch()).toEqual(expect.stringContaining('spider-man'));
    });
});

describe('method - helpSearch() DC', () => {
    test('Character Search is renderend differently - DC', () => {
        const c = new api.ApiUtils('dc');
        expect(c.helpSearch()).toEqual(expect.stringContaining('superman'));
        expect(c.helpSearch()).toEqual(expect.stringContaining('batman'));
    });
});

describe('method - commonText() Marvel', () => {
    const c = new api.ApiUtils('marvel');

    test('Marvel specific documentation rendering', () => {
        expect(c.commonText()).toHaveProperty('base');
        expect(c.commonText()).toHaveProperty('base.description');
        expect(c.commonText()).toHaveProperty('base.description', expect.stringContaining('Marvel'));
        expect(c.commonText()).toHaveProperty('base.notes');

        const bn = c.commonText().base.notes;
        expect(bn).toEqual(
            expect.arrayContaining([
                expect.stringContaining('Marvel'),
            ]),
        );

        expect(c.commonText()).toHaveProperty('character');
        expect(c.commonText()).toHaveProperty('character.description');
        expect(c.commonText()).toHaveProperty('character.description', expect.stringContaining('Marvel'));

        const cn = c.commonText().character.notes;
        expect(cn).toEqual(
            expect.arrayContaining([
                expect.stringContaining('iron man'),
                expect.stringContaining('spider-man'),
            ]),
        );

        expect(c.commonText()).toHaveProperty('character.notesExtended');
    });
});

describe('method - commonText() DC', () => {
    const c = new api.ApiUtils('dc');

    test('DC specific documentation rendering', () => {
        expect(c.commonText()).toHaveProperty('base');
        expect(c.commonText()).toHaveProperty('base.description');
        expect(c.commonText()).toHaveProperty('base.description', expect.stringContaining('DC'));
        expect(c.commonText()).toHaveProperty('base.notes');

        const bn = c.commonText().base.notes;
        expect(bn).toEqual(
            expect.arrayContaining([
                expect.stringContaining('DC'),
            ]),
        );

        expect(c.commonText()).toHaveProperty('character');
        expect(c.commonText()).toHaveProperty('character.description');
        expect(c.commonText()).toHaveProperty('character.description', expect.stringContaining('DC'));

        const rt = c.commonText().character.notes;
        expect(rt).toEqual(
            expect.arrayContaining([
                expect.stringContaining('superman'),
                expect.stringContaining('batman'),
            ]),
        );

        expect(c.commonText()).toHaveProperty('character.notesExtended');
    });
});

describe('method -  direction()', () => {
    const c = new api.ApiUtils('marvel');

    test('direction utility', () => {
        expect(c.direction('asc')).toEqual(1);
        expect(c.direction('desc')).toEqual(-1);
    });
});

describe('method - handleConfig()', () => {
    const c = new api.ApiUtils('marvel');

    const config1 = { limit: 10, universe: 'marvel' };

    const config2 = {
        h: 'name,first appearance,gsm,appearances,sex,year',
        s: 'year:asc,appearances:desc',
        pretty: '',
        prune: '',
        random: -1,
        seed: -1,
        limit: 100,
        universe: 'dc',
    };

    const config3 = {
        characters: 'man,-woman',
        h: ['name', 'first appearance', 'appearances', 'sex', 'year'],
        s: [
            { column: 'year', sort: 'asc' },
            { column: 'appearances', sort: 'desc' },
        ],
        random: false,
        limit: 100,
        universe: 'dc',
    };

    const config4 = {
        random: true,
        seed: true,
        universe: 'dc',
    };

    test('config 1', () => {
        const cf1 = c.handleConfig(config1);
        expect(cf1).not.toHaveProperty('characters');
        expect(cf1).toHaveProperty('format', undefined);
        expect(cf1).not.toHaveProperty('h');
        expect(cf1).toHaveProperty('help', false);
        expect(cf1).toHaveProperty('limit', 10);
        expect(cf1).toHaveProperty('nulls', 'first');
        expect(cf1).toHaveProperty('pretty', false);
        expect(cf1).toHaveProperty('prune', false);
        expect(cf1).not.toHaveProperty('random');
        expect(cf1).not.toHaveProperty('s');
        expect(cf1).toHaveProperty('universe', 'marvel');
    });

    test('config 2', () => {
        const cf1 = c.handleConfig(config2);
        expect(cf1).not.toHaveProperty('characters');
        expect(cf1).toHaveProperty('format', undefined);
        expect(cf1).toHaveProperty('h', expect.arrayContaining(['name', 'first appearance', 'gsm', 'appearances', 'sex', 'year']));
        expect(cf1).toHaveProperty('help', false);
        expect(cf1).toHaveProperty('limit', 100);
        expect(cf1).toHaveProperty('nulls', 'first');
        expect(cf1).toHaveProperty('pretty', true);
        expect(cf1).toHaveProperty('prune', true);
        expect(cf1).toHaveProperty('random', false);
        expect(cf1).toHaveProperty('s');
        expect(cf1).toHaveProperty('s[0].column', 'year');
        expect(cf1).toHaveProperty('s[0].sort', 1);
        expect(cf1).toHaveProperty('s[1].column', 'appearances');
        expect(cf1).toHaveProperty('s[1].sort', -1);
        expect(cf1).toHaveProperty('seed', false);
        expect(cf1).toHaveProperty('universe', 'dc');
    });

    test('config 3', () => {
        const cf1 = c.handleConfig(config3);
        expect(cf1).toHaveProperty('characters');
        expect(cf1).toHaveProperty('characters.some', expect.arrayContaining(['man']));
        expect(cf1).toHaveProperty('characters.every', []);
        expect(cf1).toHaveProperty('characters.exclude', expect.arrayContaining(['woman']));
        expect(cf1).toHaveProperty('format', undefined);
        expect(cf1).toHaveProperty('h', expect.arrayContaining(['name', 'first appearance', 'appearances', 'sex', 'year']));
        expect(cf1).toHaveProperty('help', false);
        expect(cf1).toHaveProperty('limit', 100);
        expect(cf1).toHaveProperty('nulls', 'first');
        expect(cf1).toHaveProperty('pretty', false);
        expect(cf1).toHaveProperty('prune', false);
        expect(cf1).toHaveProperty('s');
        expect(cf1).toHaveProperty('s[0].column', 'year');
        expect(cf1).toHaveProperty('s[0].sort', 1);
        expect(cf1).toHaveProperty('s[1].column', 'appearances');
        expect(cf1).toHaveProperty('s[1].sort', -1);
        expect(cf1).toHaveProperty('universe', 'dc');
    });

    test('config 4', () => {
        const cf1 = c.handleConfig(config4);
        expect(cf1).not.toHaveProperty('characters');
        expect(cf1).toHaveProperty('format', undefined);
        expect(cf1).not.toHaveProperty('h');
        expect(cf1).toHaveProperty('help', false);
        expect(cf1).toHaveProperty('nulls', 'first');
        expect(cf1).toHaveProperty('pretty', false);
        expect(cf1).toHaveProperty('prune', false);
        expect(cf1).toHaveProperty('random', true);
        expect(cf1).not.toHaveProperty('s');
        expect(cf1).toHaveProperty('universe', 'dc');
    });
});

describe('method - handleParamTypes()', () => {
    const c = new api.ApiUtils('dc');

    test('handlePramTypes utility', () => {
        expect(c.handleParamTypes('string1,string2')).toEqual(expect.arrayContaining(['string1', 'string2']));
        expect(c.handleParamTypes(['string1', 'string2'])).toEqual(expect.arrayContaining(['string1', 'string2']));

        const obj = c.handleParamTypes({ string1: 'string2' });
        expect(obj[0]).toHaveProperty('string1', 'string2');
    });
});

describe('method - isStr()', () => {
    const c = new api.ApiUtils('marvel');

    test('isStr utility', () => {
        expect(c.isStr('1')).toEqual(true);
        expect(c.isStr(1)).toEqual(false);
    });
});

describe('method - permutate()', () => {
    const c = new api.ApiUtils('marvel');

    test('permutation utility', () => {
        expect(c.permutate('spider-man')).toEqual(expect.arrayContaining(['spider-man', 'spider man', 'spiderman']));
        expect(c.permutate(['spider-man', 'wonder woman'])).toEqual(expect.arrayContaining([
            'spider-man',
            'spider man',
            'spiderman',
            'wonder woman',
            'wonder-woman',
            'wonderwoman',
        ]));
    });
});

describe('method - popText()', () => {
    const c = new api.ApiUtils('marvel');

    test('popText utility', () => {
        expect(c.popText('base.description')).toEqual(expect.stringContaining('Marvel'));
    });
});

describe('method - searchObject()', () => {
    const c = new api.ApiUtils('dc');
    const so1 = c.searchObj(['grösshorn', 'growler', 'grover', '-cleveland', 'züm', 'zuggernaut']);
    const so2 = c.searchObj(['bat+man', '-earth']);

    test('searchObject utility - Config 1', () => {
        expect(so1).toHaveProperty('some', expect.arrayContaining(['zuggernaut', 'züm', 'grover', 'growler', 'grösshorn']));
        expect(so1).toHaveProperty('every', []);
        expect(so1).toHaveProperty('exclude', expect.arrayContaining(['cleveland']));
    });

    test('searchObject utility - Config 2', () => {
        expect(so2).toHaveProperty('some', []);
        expect(so2).toHaveProperty('every', expect.arrayContaining(['bat', 'man']));
        expect(so2).toHaveProperty('exclude', expect.arrayContaining(['earth']));
    });
});

describe('method - sortObject()', () => {
    const c = new api.ApiUtils('dc');
    const so1 = c.sortObj('name:desc');
    const so2 = c.sortObj('year:asc,appearances:desc');
    const so3 = c.sortObj({ column: 'year', sort: 'asc' });
    const so4 = c.sortObj('name');

    test('sortObject utility - Config 1 - String', () => {
        expect(so1[0]).toHaveProperty('column', 'name');
        expect(so1[0]).toHaveProperty('sort', -1);
    });

    test('sortObject utility - Config 2 - String', () => {
        expect(so2[0]).toHaveProperty('column', 'year');
        expect(so2[0]).toHaveProperty('sort', 1);
        expect(so2[1]).toHaveProperty('column', 'appearances');
        expect(so2[1]).toHaveProperty('sort', -1);
    });

    test('sortObject utility - Config 3 - Object', () => {
        expect(so3[0]).toHaveProperty('column', 'year');
        expect(so3[0]).toHaveProperty('sort', 1);
    });

    test('sortObject utility - Config 4 - Default', () => {
        expect(so4[0]).toHaveProperty('column', 'name');
        expect(so4[0]).toHaveProperty('sort', 1);
    });
});

/**
 * The validateParams method is used to generate a JOI based
 * validation object for HAPI.js payload validation AND
 * display the documentation for the OpenAPI documentation, as such
 * it's very highly nested and would be brittle to test in depth
 */
describe('method - validateParams()', () => {
    const c = new api.ApiUtils('dc');

    test('validateParams utility - Config 1 - characters, format', () => {
        const validBaseQParams = ['characters', 'format'];

        // POST request applies 1 JOI alternatives (str)
        const so1 = c.validateParams(validBaseQParams, 'get');
        expect(so1).toHaveProperty('_ids._byKey');
        const keys = [...so1._ids._byKey.keys()];
        expect(keys).toEqual(expect.arrayContaining(validBaseQParams));

        const char = so1._ids._byKey.get('characters');
        expect(char).toHaveProperty('id', 'characters');
        expect(char).toHaveProperty('schema.$_terms.matches.length', 1);

        // POST request applies 2 JOI alternatives (arry, arryStr)
        const so2 = c.validateParams(['characters'], 'post');
        const char2 = so2._ids._byKey.get('characters');
        expect(char2).toHaveProperty('id', 'characters');
        expect(char2).toHaveProperty('schema.$_terms.matches.length', 2);
    });

    test('validateParams utility - Config 2 - h, help', () => {
        const validBaseQParams = ['h', 'help'];

        // POST request applies 1 JOI alternatives (str)
        const so1 = c.validateParams(validBaseQParams, 'get');
        expect(so1).toHaveProperty('_ids._byKey');
        const keys = [...so1._ids._byKey.keys()];
        expect(keys).toEqual(expect.arrayContaining(validBaseQParams));

        const char1 = so1._ids._byKey.get('h');
        expect(char1).toHaveProperty('id', 'h');
        expect(char1).toHaveProperty('schema._flags.description', 'Headers to display. Either a string or Array of strings');
        expect(char1).toHaveProperty('schema.$_terms.matches.length', 1);

        const char2 = so1._ids._byKey.get('help');
        expect(char2).toHaveProperty('id', 'help');
        expect(char2).toHaveProperty('schema._flags.description', expect.stringContaining('List available options.'));

        // POST request applies 2 JOI alternatives (arry, str)
        const so3 = c.validateParams(['h'], 'post');
        const char3 = so3._ids._byKey.get('h');
        expect(char3).toHaveProperty('id', 'h');
        expect(char3).toHaveProperty('schema.$_terms.matches.length', 2);
    });

    test('validateParams utility - Config 3 - limit, nulls', () => {
        const validBaseQParams = ['limit', 'nulls'];
        const so1 = c.validateParams(validBaseQParams, 'get');

        expect(so1).toHaveProperty('_ids._byKey');
        const keys = [...so1._ids._byKey.keys()];
        expect(keys).toEqual(expect.arrayContaining(validBaseQParams));

        const char1 = so1._ids._byKey.get('limit');
        expect(char1).toHaveProperty('id', 'limit');
        expect(char1).toHaveProperty('schema._flags.description', 'Limit result set. \'0\' for no limit');

        const char2 = so1._ids._byKey.get('nulls');
        expect(char2).toHaveProperty('id', 'nulls');
        expect(char2).toHaveProperty('schema._flags.description', expect.stringContaining('Sort null values first or last in order.'));
    });

    test('validateParams utility - Config 4 - pretty, prune', () => {
        const validBaseQParams = ['pretty', 'prune'];
        const so1 = c.validateParams(validBaseQParams, 'get');

        expect(so1).toHaveProperty('_ids._byKey');
        const keys = [...so1._ids._byKey.keys()];
        expect(keys).toEqual(expect.arrayContaining(validBaseQParams));

        const char1 = so1._ids._byKey.get('pretty');
        expect(char1).toHaveProperty('id', 'pretty');
        expect(char1).toHaveProperty('schema._flags.description', expect.stringContaining('Pretty print the result set.'));

        const char2 = so1._ids._byKey.get('prune');
        expect(char2).toHaveProperty('id', 'prune');
        expect(char2).toHaveProperty('schema._flags.description', expect.stringContaining('Remove keys with null values.'));
    });

    test('validateParams utility - Config 4 - random, sort, seed', () => {
        const validBaseQParams = ['random', 's', 'seed'];

        // POST request applies 3 JOI alternatives (str, arry, obj)
        const so1 = c.validateParams(validBaseQParams, 'get');

        expect(so1).toHaveProperty('_ids._byKey');
        const keys = [...so1._ids._byKey.keys()];
        expect(keys).toEqual(expect.arrayContaining(validBaseQParams));

        const char1 = so1._ids._byKey.get('random');
        expect(char1).toHaveProperty('id', 'random');
        expect(char1).toHaveProperty('schema._flags.description', expect.stringContaining('Returns array of random superheros based on limit.'));

        // POST request applies 3 JOI alternatives (arry, obj, str)
        const so2 = c.validateParams(['s'], 'post');

        const char2 = so2._ids._byKey.get('s');
        expect(char2).toHaveProperty('id', 's');
        expect(char2).toHaveProperty('schema.$_terms.matches.length', 3);

        const char3 = so1._ids._byKey.get('seed');
        expect(char3).toHaveProperty('id', 'seed');
        expect(char3).toHaveProperty('schema._flags.description', expect.stringContaining('Keep the same random characters on multiple requests.'));
    });
});
