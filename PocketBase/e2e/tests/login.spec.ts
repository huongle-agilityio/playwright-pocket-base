import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES, USER } from '@/constants';

// Utils
import { waitForPostResponse } from '@/utils';

test.describe.configure({ timeout: 90_000 });

const INVALID_CASES = [
  {
    field: 'username',
    email: USER.INVALID_USER_NAME,
    password: USER.PASSWORD,
  },
  {
    field: 'password',
    email: USER.USER_NAME,
    password: USER.INVALID_PASSWORD,
  },
];

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Success with valid inputs', async ({ page, loginPage, dashboardPage }) => {
    await test.step('Submit form with valid inputs', async () => {
      const responsePromise = waitForPostResponse({ url: API_URLS.LOGIN, page });
      await loginPage.form.loginAs(USER.USER_NAME, USER.PASSWORD);

      const response = await responsePromise;
      const responseBody = await response.json();

      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
      // Check token exists and email is correct
      expect(responseBody.token || responseBody.access_token).toBeTruthy();
      expect(responseBody.record.email).toBe(USER.USER_NAME);
    });

    await test.step('Dashboard is loaded', async () => {
      await dashboardPage.verifyDashboardLoaded();
    });
  });

  INVALID_CASES.forEach(({ field, email, password }) => {
    test(`Failure with the invalid ${field}`, async ({ page, loginPage }) => {
      await test.step(`Submit form with invalid ${field} input`, async () => {
        const responsePromise = waitForPostResponse({ url: API_URLS.LOGIN, page });
        await loginPage.form.loginAs(email, password);

        const response = await responsePromise;
        const responseBody = await response.json();

        expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
        // Check token exists and email is correct
        expect(responseBody.token || responseBody.access_token).toBeFalsy();
        expect(responseBody.message).toBe(MESSAGES.FAILED_TO_AUTHENTICATE);
      });

      await test.step('Error message is displayed', async () => {
        await loginPage.verifyToastMessage(MESSAGES.INVALID_LOGIN_CREDENTIALS);
      });
    });
  });

  test('With empty inputs', async ({ loginPage }) => {
    await test.step('Submit form with empty inputs', async () => {
      await loginPage.form.loginAs('', '');
    });

    await test.step('The input is invalid', async () => {
      const isValid = await loginPage.form.email.evaluate((input: HTMLInputElement) =>
        input.checkValidity(),
      );

      expect(isValid).toBe(false);
    });
  });
});
