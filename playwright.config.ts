import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: false,
    viewport: null,                   
    screenshot: 'on',     
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
});