import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'qa.spec.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4173/CEMiTool-Cabernet-y-Pinot/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/CEMiTool-Cabernet-y-Pinot/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
})
