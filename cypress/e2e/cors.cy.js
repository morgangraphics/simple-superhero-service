import axios from 'axios';

/**
 * Added 404 handling for bad routes
 */
describe('404 route testing', () => {
    it('testing 404 handling', () => {
        axios({
            method: 'get',
            url: `${Cypress.env('sssApiUrl')}/foo`,
        }).then(response => response).catch(err => {
            expect(err.response.status).to.equal(404);
            expect(err.response.statusText).to.equal('Not Found');
        });
    });
});

/**
 * Reglardless of CORS ORIGIN, Healthcheck endpoint should always be available.
 */
describe('CORS healthcheck', () => {
    it('healthcheck endpoint', () => {
        axios({
            method: 'get',
            url: `${Cypress.env('sssApiUrl')}/healthcheck`,
            responseType: 'json',
        }).then(response => {
            expect(response.status).to.equal(200);
            expect(response.statusText).to.equal('OK');
            expect(response.headers['x-simple-superhero-service']).to.not.be.null;
        });
    });
});

describe('OPTIONS Request test', () => {
    it('options response', () => {
        axios({
            method: 'options',
            url: `${Cypress.env('sssApiUrl')}/test`,
            responseType: 'json',
        }).then(response => {
            expect(response.status).to.equal(204);
        });
    });
});

describe('CORS marvel endpoint', () => {
    // This test should only run if there is a valid CORS ORIGIN
    if (process.env['cors-valid']) {
        it('marvel endpoint - get - valid-origin', () => {
            axios({
                method: 'get',
                url: `${Cypress.env('sssApiUrl')}/marvel?limit=5`,
                responseType: 'json',
            }).then(response => {
                expect(response.status).to.equal(200);
                expect(response.data.length).to.equal(5);
            });
        });
    } else {
        it('marvel endpoint - get - invalid-origin', () => {
            axios({
                method: 'get',
                url: `${Cypress.env('sssApiUrl')}/marvel?limit=5`,
                responseType: 'json',
            }).then(response => {

            }).catch(err => {
                expect(err.message).to.equal('Network Error');
            });
        });
    }

    /**
   * This request triggers a pre-flight request due to the custom header
   * It will fail
   */
    it('marvel endpoint - pre-flight with custom header', () => {
        axios({
            method: 'get',
            url: `${Cypress.env('sssApiUrl')}/marvel`,
            responseType: 'json',
            headers: { 'X-CUSTOM-HEADER': 'CUSTOM-HEADER-VALUE' },
        }).then(response => {

        }).catch(err => {
            expect(err.message).to.equal('Network Error');
        });
    });
});
