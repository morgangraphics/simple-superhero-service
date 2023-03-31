const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseURL: 'https://localhost',
    chromeWebSecurity: true,
    env: {
      sssApiUrl: 'https://127.0.0.1:3000',
    },
    port: 3100,
    watchForFileChanges: true
  },
});
