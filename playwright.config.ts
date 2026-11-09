import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'dot' : 'html',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/openapi-viewer`,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'unit', testMatch: /.*\.unit\.spec\.ts/ },
    { name: 'e2e', testMatch: /.*\.e2e\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'snapshot', testMatch: /.*\.snap\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
})
