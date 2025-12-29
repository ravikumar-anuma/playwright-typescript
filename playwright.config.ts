import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',
  // Use more workers in CI, otherwise let Playwright decide locally
  workers: process.env.CI ? 4 : undefined,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: process.env.CI ? true : false,
    viewport: null,
    video: 'on',
    screenshot: 'on',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});