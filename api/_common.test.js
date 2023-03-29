const common = require('./_common');

describe('Testing _common.js  - cache', () => {
    test('testing common values length', () => {
        const c = common.cache;
        expect(c).toHaveProperty('dc', []);
        expect(c).toHaveProperty('marvel', []);
        expect(c).toHaveProperty('search', []);
    });
});

describe('Testing _common.js  - validBaseQParams', () => {
    test('testing common values length', () => {
        expect(common.validBaseQParams).toHaveLength(11);
    });

    test('testing common values content', () => {
        expect(common.validBaseQParams).toEqual(expect.arrayContaining(['characters', 'format', 'h', 'help', 'limit', 'nulls', 'pretty', 'prune', 'random', 's', 'seed']));
    });
});

describe('Testing _common.js  - validCharQParams', () => {
    test('testing common values length', () => {
        expect(common.validCharQParams).toHaveLength(9);
    });

    test('testing common values content', () => {
        expect(common.validCharQParams).toEqual(expect.arrayContaining(['characters', 'format', 'h', 'help', 'limit', 'nulls', 'pretty', 'prune', 's']));
    });
});

describe('Testing _common.js - copy', () => {
    const foo = {
        one: 1,
        two: 2,
    };
    test('testing deep copy method', () => {
        const newObj = common.copy(foo);
        foo.one = 'Q';
        expect(newObj).toHaveProperty('one', 1);
    });
});
