import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Constants
import { BASE_URL } from '@/constants';

// Utils
import { extractAccessToken } from '@/utils';

const accessToken = extractAccessToken();
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  tsconfig: './tsconfig.json',
  testDir: './e2e/tests',
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
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      grep: /@private/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      grep: /@private/,
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      grep: /@private/,
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'chromium',
      grep: /@public/,
      grepInvert: /@setup/,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      grep: /@public/,
      grepInvert: /@setup/,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      grep: /@public/,
      grepInvert: /@setup/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
