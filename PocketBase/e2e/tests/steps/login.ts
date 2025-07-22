import { type Response } from '@playwright/test';
import { expect, Given, Then, When } from '@/fixtures/authFixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES, USER } from '@/constants';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { waitForPostResponse } from '@/utils';

let response: Response;
let responseBody: { token: string; record: User; message: string };

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

// Scenario: Success with valid inputs
When('I submit the login form with correct credentials', async ({ loginPage, page }) => {
  const responsePromise = waitForPostResponse({ url: API_URLS.LOGIN, page });
  await loginPage.form.loginAs(USER.USER_NAME, USER.PASSWORD);

  response = await responsePromise;
  responseBody = await response.json();
});

Then('the dashboard is loaded', async ({ dashboardPage }) => {
  await dashboardPage.verifyDashboardLoaded();
});

Then('I should receive a valid token and correct email in response', async () => {
  expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  expect(responseBody.token).toBeTruthy();
  expect(responseBody.record.email).toBe(USER.USER_NAME);
});

// Scenario: Failure with invalid "<field>"
const INVALID_CASES = {
  username: { email: USER.INVALID_USER_NAME, password: USER.PASSWORD },
  password: { email: USER.USER_NAME, password: USER.INVALID_PASSWORD },
};

When(
  'I submit the login form with invalid {string} input',
  async ({ page, loginPage }, field: 'username' | 'password') => {
    const responsePromise = waitForPostResponse({ url: API_URLS.LOGIN, page });
    await loginPage.form.loginAs(INVALID_CASES[field].email, INVALID_CASES[field].password);

    response = await responsePromise;
    responseBody = await response.json();
  },
);

Then('I should see an error message {string}', async ({ loginPage }) => {
  await loginPage.verifyToastMessage(MESSAGES.INVALID_LOGIN_CREDENTIALS);
});

Then('the response should contain message {string}', async () => {
  expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
  expect(responseBody.token).toBeFalsy();
  expect(responseBody.message).toBe(MESSAGES.FAILED_TO_AUTHENTICATE);
});

// Scenario: With empty inputs
When('I submit the login form with empty inputs', async ({ loginPage }) => {
  await loginPage.form.loginAs('', '');
});

Then('the email input should be invalid', async ({ loginPage }) => {
  const isValid = await loginPage.form.email.evaluate((input: HTMLInputElement) =>
    input.checkValidity(),
  );

  expect(isValid).toBe(false);
});
