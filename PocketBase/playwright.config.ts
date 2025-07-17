import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Constants
import { BASE_URL } from '@/constants';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const bddConfig = defineBddConfig({
  features: 'e2e/tests/features/*.feature',
  steps: ['e2e/tests/steps/*.ts', 'e2e/fixtures/index.ts'],
  featuresRoot: 'e2e/tests/features',
});

export default defineConfig({
  tsconfig: './tsconfig.json',
  testDir: bddConfig,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  reporter: 'html',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      testIgnore: /googleAuth\.setup\.ts/,
      testDir: './e2e/setup',
    },

    {
      name: 'googleAuthSetup',
      testMatch: /googleAuth\.setup\.ts/,
      testDir: './e2e/setup',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          args: [
            '--ignore-certificate-errors',
            '--disable-web-security',
            '--no-sandbox-and-elevated',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
