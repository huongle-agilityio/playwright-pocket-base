import { Response } from '@playwright/test';

// Fixtures
import { AfterScenario, expect, Given, Then, When } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, MOCK_USER, STATUS_CODES } from '@/constants';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { deleteAnUser, waitForPostResponse } from '@/utils';

let response: Response;
let responseBody;
let payload: User;

Given('I open the add new user form', async ({ dashboardPage, userForm }) => {
  await dashboardPage.clickAddNew();
  await userForm.verifyTitle('New users record');
});

AfterScenario({ tags: '@addNewUser' }, async ({ tablePage, apiContext }) => {
  await deleteAnUser({ tablePage, user: MOCK_USER, context: apiContext });
});

// Scenario: Failure with empty inputs
When('I submit the user form', async ({ userForm }) => {
  await userForm.submit();
});

Then('the form title should be {string}', async ({ userForm }, title: string) => {
  await userForm.verifyTitle(title);
});

// Scenario: Leave the form while filling it
When('I fill the email field', async ({ userForm }) => {
  await userForm.email.fill(MOCK_USER.email);
});

When('I cancel the form', async ({ userForm }) => {
  await userForm.cancel();
  await userForm.page.getByRole('button', { name: 'Yes' }).click();
});

Then('the form should be closed', async ({ userForm }) => {
  const title = userForm.page.getByRole('heading', { name: 'New users record' });
  await expect(title).not.toBeVisible();
});

// Scenario: Successfully with filling the required inputs
When('I fill the user form with required inputs', async ({ userForm, page }) => {
  const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
  await userForm.fillForm(MOCK_USER);

  response = await responsePromise;
  responseBody = await response.json();
});

Then('the response is successful with the created user', async () => {
  expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  expect(responseBody.email).toBe(MOCK_USER.email);
  expect(responseBody.id).toBe(MOCK_USER.id);
});

Then('the user should appear in the table', async ({ tablePage }) => {
  await tablePage.waitForTableToLoad();
  await tablePage.verifyUserRow(MOCK_USER);
});

// Scenario: Successfully with filling in all the inputs
When('I fill the form with all inputs \\(except avatar)', async ({ userForm }) => {
  payload = {
    ...MOCK_USER,
    isVerified: true,
    name: 'lorem',
    username: 'lorem',
    website: 'https://example.com',
  };

  await userForm.fillForm(payload);
});

Then('the user should appear in the table with all information', async ({ tablePage }) => {
  await tablePage.waitForTableToLoad();
  await tablePage.verifyUserRow(payload);
});

// Scenario: Failure with no permission to upload avatar
When('I fill the form with avatar file', async ({ userForm }) => {
  payload = {
    ...MOCK_USER,
    avatar: 'test-image.png',
  };

  await userForm.fillForm(payload);
});

Then('an error message should contain {string}', async ({ userForm }, message) => {
  await userForm.verifyErrorMessage(new RegExp(message));
});

const INVALID_FIELD_CASES = {
  invalidLengthUsername: {
    payload: {
      ...MOCK_USER,
      username: 'lo',
    },
    message: MESSAGES.LIMIT_CHARACTERS(),
  },
  invalidUsername: {
    payload: {
      ...MOCK_USER,
      username: 'lorem lorem',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  invalidEmail: {
    payload: {
      ...MOCK_USER,
      email: 'test555@g',
    },
    message: MESSAGES.INVALID_EMAIL,
  },
  invalidId: {
    payload: {
      ...MOCK_USER,
      id: 'lorem aaaabdada',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  emailExists: {
    payload: {
      ...MOCK_USER,
      email: 'test10@example.com',
    },
    message: MESSAGES.UNIQUE_VALUE,
  },
};

// Scenario: Failure when input is invalid
Given(
  'a user may already exist with {string} if {string}',
  async ({ apiContext }, field, preStep) => {
    if (preStep === 'true') {
      payload = INVALID_FIELD_CASES[field].payload;
      await apiContext.post(API_URLS.USER, { data: payload });
    }
  },
);

When('I fill the form with {string}', async ({ page, userForm }, field) => {
  payload = INVALID_FIELD_CASES[field].payload;

  const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
  await userForm.fillForm(payload);

  response = await responsePromise;
  responseBody = await response.json();
});

Then('the response should be 400 with error message', async ({ userForm }) => {
  await userForm.verifyTitle('New users record');

  expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
  expect(responseBody.message).toBe(MESSAGES.FAILED_TO_CREATE_RECORD);
});

Then(
  'an error message for {string} should be appeared on the form',
  async ({ userForm }, field) => {
    await userForm.verifyErrorMessage(INVALID_FIELD_CASES[field].message);
  },
);

Then('the user is deleted if exists', async ({ apiContext }) => {
  await apiContext.delete(`${API_URLS.USER}/${payload.id}`);
});
