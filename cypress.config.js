const c = require("config");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseURL: 'https://localhost',
    chromeWebSecurity: true,
    env: {
      sssApiUrl: 'https://127.0.0.1:3000',
    },
    port: 3100,
    setupNodeEvents(on, config) {
      // Ensure that environemnt variables are availale in the browser. via Cypress.env('NODE_ENV')
      config.env = {
        ...process.env,
        ...config.env
      }
      return config
    },
    watchForFileChanges: true
  },
});
