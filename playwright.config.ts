import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { ENV } from './configs/env.config';

// Generates Playwright specs from the .feature files into .features-gen (run `npx bddgen`).
const bddTestDir = defineBddConfig({
  features: 'tests/bdd/features/*.feature',
  // The fixtures file is included so generated specs import our custom `test`.
  steps: ['tests/bdd/steps/*.ts', 'utils/fixtures.ts'],
});

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: ENV.baseUrl,
    // Artifacts are kept only when a test fails, so passing runs stay fast and small.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api', use: { baseURL: ENV.apiBaseUrl } },
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/ui', use: { ...devices['Desktop Safari'] } },
    { name: 'bdd', testDir: bddTestDir, use: { ...devices['Desktop Chrome'] } },
  ],
});
