const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: [
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false
    }],
    ['html', { outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});