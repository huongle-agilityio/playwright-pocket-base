import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES, USER } from '@/constants';

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

test.describe(
  'Login',
  {
    tag: '@public',
  },
  () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.form.reset();
    });

    test('Verify that the user can log in successfully', async ({
      page,
      loginPage,
      dashboardPage,
    }) => {
      await test.step('Fill username and password', async () => {
        await loginPage.form.loginAs(USER.USER_NAME, USER.PASSWORD);
      });

      await test.step('Verify that response token exists and email is correct', async () => {
        // Wait for login response (adjust URL to match your API)
        const loginResponse = await page.waitForResponse(
          (res) => res.url().includes(API_URLS.LOGIN) && res.request().method() === 'POST',
        );
        const responseBody = await loginResponse.json();

        expect(loginResponse.status()).toBe(STATUS_CODES.SUCCESS);
        // Check token exists and email is correct
        expect(responseBody.token || responseBody.access_token).toBeTruthy();
        expect(responseBody.record.email).toBe(USER.USER_NAME);
      });

      await test.step('Verify dashboard loaded', async () => {
        await dashboardPage.verifyDashboardLoaded();
      });

      await test.step('Logout from dashboard', async () => {
        await dashboardPage.logout();
      });
    });

    INVALID_CASES.forEach(({ field, email, password }) => {
      test(`Verify that the user failed to log in with the wrong ${field}`, async ({
        page,
        loginPage,
      }) => {
        await test.step('Fill username and password', async () => {
          await loginPage.form.loginAs(email, password);
        });

        await test.step('Verify that response token exists and email is correct', async () => {
          // Wait for login response (adjust URL to match your API)
          const loginResponse = await page.waitForResponse(
            (res) => res.url().includes(API_URLS.LOGIN) && res.request().method() === 'POST',
          );
          const responseBody = await loginResponse.json();

          expect(loginResponse.status()).toBe(STATUS_CODES.BAD_REQUEST);
          // Check token exists and email is correct
          expect(responseBody.token || responseBody.access_token).toBeFalsy();
          expect(responseBody.message).toBe(MESSAGES.FAILED_TO_AUTHENTICATE);
        });

        await test.step('Verify error message', async () => {
          await loginPage.verifyToastMessage(MESSAGES.INVALID_LOGIN_CREDENTIALS);
        });
      });
    });
  },
);
