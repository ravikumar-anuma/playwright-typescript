import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests',
  // Use more workers in CI, otherwise let Playwright decide locally
  workers: process.env.CI ? 4 : undefined,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: false, // headed mode by default
    viewport: null,
    video: 'on', // record video for all tests (workflow will keep artifacts)
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
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});