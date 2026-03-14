import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: 'src/tests',
  // Use more workers in CI, otherwise let Playwright decide locally
  workers: process.env.CI ? 4 : undefined,
  retries: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    headless: process.env.CI ? true : false,
    viewport: null,
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), 'playwright', '.auth', 'user.json'),
      },
      dependencies: ['setup'],
    },
  ],
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['playwright-smart-reporter', {
      // Place smart report and history inside the standard playwright-report folder
      // Use absolute paths so the reporter writes to repo-root `playwright-report/`
      outputFile: path.join(process.cwd(), 'playwright-report', 'smart-report.html'),
      historyFile: path.join(process.cwd(), 'playwright-report', 'test-history.json'),
      maxHistoryRuns: 10,
      performanceThreshold: 0.2,
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      teamsWebhook: process.env.TEAMS_WEBHOOK_URL,
      // Feature flags
      enableRetryAnalysis: true,
      enableFailureClustering: true,
      enableStabilityScore: true,
      enableGalleryView: true,
      enableComparison: true,
      enableAIRecommendations: true,
      enableTraceViewer: true,
      enableHistoryDrilldown: true,
      enableNetworkLogs: true,
      stabilityThreshold: 70,
      retryFailureThreshold: 3,
      baselineRunId: 'main-branch-baseline', // optional
    }],
  ],
});