const common = require('../api/_common');
const file = require('./files.js');
const resp = require('./files.mock.response.json');


describe('Testing files.js  - Class instaniation', () => {

    const c = new file.FileUtils('marvel');

    test('class instantiated', () => {
        expect(c).toBeInstanceOf(file.FileUtils);
    });

    test('constructor - characters object', () => {
        expect(c.characters).toHaveProperty('marvel', 'marvel-wikia-data_csv.csv');
        expect(c.characters).toHaveProperty('dc', 'dc-wikia-data_csv.csv');
    });

    test('constructor - config', () => {
        expect(c.config).toEqual('');
    });

    test('constructor - limit_buffer', () => {
        expect(c.limit_buffer).toEqual(300);
    });

    test('constructor - seed', () => {
        expect(c.seed).toEqual(999111);
    });

    test('constructor - total_data', () => {
        expect(c.total_data).toEqual(0);
    });

    test('constructor - universe', () => {
        expect(c.universe).toEqual("marvel");
    });

});

/**
 * We're going to do things 
 */



describe('method - filterCharacters', () => {

    const c = new file.FileUtils('marvel');
    c.config = {
        characters: { 
            some: [], 
            every: [ 'spider', 'man' ], 
            exclude: []
        },
        format: undefined,
        help: false,
        limit: 100,
        nulls: 'first',
        pretty: false,
        prune: false,
        s: [ 
            { column: 'name', 
            sort: -1 
        } 
        ],
        universe: 'marvel'
      }

     // mocked response
     common.cache["marvel"] = resp;


    test('method - filterCharacters - returns only names that contain spider and man', () => {
        const filtered = c.filterCharacters();

        const names = filtered.filter(itm => itm.name)cp ;

        console.log("NAMES = ", names)

        expect(filtered).toHaveProperty('length', 5);
        expect(filtered[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');
    });


});

// describe('method - filterData', () => {

//     const c = new file.FileUtils('marvel');
//     const cf0 = {
//         characters: { 
//             some: [], 
//             every: [ 'spider', 'man' ], 
//             exclude: []
//         },
//         format: undefined,
//         help: false,
//         limit: 100,
//         nulls: 'first',
//         pretty: false,
//         prune: false,
//         s: [ 
//             { column: 'name', 
//             sort: -1 
//         } 
//         ],
//         universe: 'marvel'
//       }

//      // mocked response
//      common.cache["marvel"] = resp;

//     c.config = cf0;

//     test('method - filterCharacters - sorting on spider-man descending order by name', () => {
//         expect(c.filterData()).toHaveProperty('length', 5);
//         expect(c.filterData()[0]).toHaveProperty('name', 'vern (spider-man) (earth-616)');
//     });


// });