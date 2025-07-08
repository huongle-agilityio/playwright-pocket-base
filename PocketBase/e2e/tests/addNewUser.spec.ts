import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, MOCK_USER, STATUS_CODES } from '@/constants';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { createApiContext, deleteAnUser, waitForPostResponse } from '@/utils';

const INVALID_FIELD_CASES = [
  {
    field: 'username',
    title:
      "Verify that the user can't create a new user when typing a username of less than 3 characters",
    payload: {
      ...MOCK_USER,
      username: 'lo',
    },
    message: MESSAGES.LIMIT_CHARACTERS(),
  },
  {
    field: 'username',
    title: "Verify that the user can't create a new user when typing the wrong username",
    payload: {
      ...MOCK_USER,
      username: 'lorem lorem',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  {
    field: 'email',
    title: "Verify that the user can't create a new user when typing a wrong format email",
    payload: {
      ...MOCK_USER,
      email: 'test555@g',
    },
    message: MESSAGES.INVALID_EMAIL,
  },
  {
    field: 'id',
    title: "Verify that the user can't create a new user when typing the wrong format ID",
    payload: {
      ...MOCK_USER,
      id: 'lorem aaaabdada',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  {
    field: 'email',
    title: "Verify that the user can't create a user when the email already exists",
    preStep: true,
    payload: {
      ...MOCK_USER,
      email: 'test10@example.com',
    },
    message: MESSAGES.UNIQUE_VALUE,
  },
];

test.describe('Add new user', () => {
  test.beforeEach(async ({ dashboardPage, userForm }) => {
    await dashboardPage.goto();
    await dashboardPage.clickAddNew();
    await userForm.verifyTitle('New users record');
  });

  test.afterEach(async ({ tablePage }) => {
    const context = await createApiContext();
    await deleteAnUser({ tablePage, user: MOCK_USER, context });
  });

  test("Verify that the user can't create user with empty inputs", async ({ userForm }) => {
    await test.step('Submit form with empty inputs', async () => {
      await userForm.submit();
    });

    await test.step('Verify that the form is not closed', async () => {
      await userForm.verifyTitle('New users record');
    });
  });

  test('Verify that the user can leave the form while the form has values', async ({
    userForm,
  }) => {
    await test.step('Cancel form with filled inputs', async () => {
      await userForm.email.fill(MOCK_USER.email);
      await userForm.cancel();
    });

    await test.step('Confirm leaving form', async () => {
      await userForm.page.getByRole('button', { name: 'Yes' }).click();
    });

    await test.step('Verify that the form is not closed', async () => {
      const title = userForm.page.getByRole('heading', { name: 'New users record' });
      await expect(title).not.toBeVisible();
    });
  });

  test('Verify that the user can add a new user with the required inputs', async ({
    page,
    userForm,
    dashboardPage,
    tablePage,
  }) => {
    await test.step('Fill form with required inputs and verify returned data matches input', async () => {
      const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
      await userForm.fillForm(MOCK_USER);

      const response = await responsePromise;
      const responseBody = await response.json();

      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
      expect(responseBody.email).toBe(MOCK_USER.email);
      expect(responseBody.id).toBe(MOCK_USER.id);
    });

    await test.step('Verify toast message and user appear in the table', async () => {
      await tablePage.waitForTableToLoad();
      await tablePage.verifyUserRow(MOCK_USER);
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_CREATED_RECORD);
    });
  });

  test('Verify that the user can add a new user by filling in all the inputs', async ({
    dashboardPage,
    userForm,
    tablePage,
  }) => {
    const payload: User = {
      ...MOCK_USER,
      isVerified: true,
      name: 'lorem',
      username: 'lorem',
      website: 'https://example.com',
    };

    await test.step('Fill form with all inputs expect avatar', async () => {
      await userForm.fillForm(payload);
    });

    await test.step('Verify toast message and user appear in the table', async () => {
      await tablePage.waitForTableToLoad();
      await tablePage.verifyUserRow(payload);
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_CREATED_RECORD);
    });
  });

  test(`Verify that the user can't upload an avatar after clicking the button Create`, async ({
    dashboardPage,
    userForm,
  }) => {
    const payload: User = {
      ...MOCK_USER,
      avatar: 'test-image.png',
    };

    await test.step('Fill form with all inputs expect avatar', async () => {
      await userForm.fillForm(payload);

      await userForm.verifyTitle('New users record');
    });

    await test.step('Verify error messages', async () => {
      await userForm.verifyErrorMessage(/test-image.*mime type must be one of: NO_UPLOADS_ALLOWED/);
      await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_CREATE_RECORD);
    });
  });

  INVALID_FIELD_CASES.forEach(({ field, message, title, payload, preStep }) => {
    test(title, async ({ page, dashboardPage, userForm, request }) => {
      if (preStep) {
        await test.step('Pre-step fill form with required inputs', async () => {
          await request.post(API_URLS.USER, { data: payload });
        });
      }

      await test.step(`Fill form with invalid ${field} and verify that the response return error message`, async () => {
        const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
        await userForm.fillForm(payload);

        const response = await responsePromise;
        const responseBody = await response.json();

        await userForm.verifyTitle('New users record');
        expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
        expect(responseBody.data[field]).toBeTruthy();
        expect(responseBody.message).toBe(MESSAGES.FAILED_TO_CREATE_RECORD);
      });

      await test.step('Verify error messages', async () => {
        await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_CREATE_RECORD);
        await userForm.verifyErrorMessage(message);
      });

      await test.step('Delete user from pre-step', async () => {
        await request.delete(`${API_URLS.USER}/${payload.id}`);
      });
    });
  });
});
