import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { isCI, isWindows } from 'std-env'

const devicesToTest = [
  'Desktop Chrome',
  // Test against other common browser engines.
  // 'Desktop Firefox',
  // 'Desktop Safari',
  // Test against mobile viewports.
  // 'Pixel 5',
  // 'iPhone 12',
  // Test against branded browsers.
  // { ...devices['Desktop Edge'], channel: 'msedge' },
  // { ...devices['Desktop Chrome'], channel: 'chrome' },
] satisfies Array<string | typeof devices[string]>

/* See https://playwright.dev/docs/test-configuration. */
export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  timeout: isWindows ? 6000 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  // Start the app automatically or use an existing dev server - much faster than building it first
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'http://localhost:3000', // Base URL for methods like page.goto()
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Nuxt configuration options */
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  projects: devicesToTest.map(p => typeof p === 'string' ? ({ name: p, use: devices[p] }) : p),
})