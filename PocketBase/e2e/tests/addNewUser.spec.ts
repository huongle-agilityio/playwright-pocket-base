import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, MOCK_USER, STATUS_CODES } from '@/constants';

// Pages
import { DashboardPage, TablePage } from '@/pages';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { deleteAnUser, waitForPostResponse } from '@/utils';

const userIsCreatedSuccessfully = async ({
  user,
  tablePage,
  dashboardPage,
}: {
  user: User;
  tablePage: TablePage;
  dashboardPage: DashboardPage;
}) => {
  await test.step('User appears in the table and toast message is displayed', async () => {
    await tablePage.waitForTableToLoad();
    await tablePage.verifyUserRow(user);
    await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_CREATED_RECORD);
  });
};

test.describe('Add new user', () => {
  test.beforeEach(async ({ dashboardPage, userForm }) => {
    await dashboardPage.goto();
    await dashboardPage.clickAddNew();
    await userForm.verifyTitle('New users record');
  });

  test.afterEach(async ({ tablePage, apiContext }) => {
    await deleteAnUser({ tablePage, user: MOCK_USER, context: apiContext });
  });

  test('Failure with empty inputs', async ({ userForm }) => {
    await test.step('Submit form', async () => {
      await userForm.submit();
    });

    await test.step('The form is not closed', async () => {
      await userForm.verifyTitle('New users record');
    });
  });

  test('Leave the form while filling it', async ({ userForm }) => {
    await test.step('Cancel form with filled inputs', async () => {
      await userForm.email.fill(MOCK_USER.email);
      await userForm.cancel();
    });

    await test.step('Confirm leaving form', async () => {
      await userForm.page.getByRole('button', { name: 'Yes' }).click();
    });

    await test.step('The form is not closed', async () => {
      const title = userForm.page.getByRole('heading', { name: 'New users record' });
      await expect(title).not.toBeVisible();
    });
  });

  test('Successfully with filling the required inputs', async ({
    page,
    userForm,
    dashboardPage,
    tablePage,
  }) => {
    await test.step('Fill form with required inputs', async () => {
      const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
      await userForm.fillForm(MOCK_USER);

      const response = await responsePromise;
      const responseBody = await response.json();

      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
      expect(responseBody.email).toBe(MOCK_USER.email);
      expect(responseBody.id).toBe(MOCK_USER.id);
    });

    await userIsCreatedSuccessfully({ user: MOCK_USER, tablePage, dashboardPage });
  });

  test('Successfully with filling in all the inputs', async ({
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

    await test.step('Fill the form with all inputs except the avatar', async () => {
      await userForm.fillForm(payload);
    });

    await userIsCreatedSuccessfully({ user: payload, tablePage, dashboardPage });
  });

  test('Failure with no permission to upload avatar', async ({ dashboardPage, userForm }) => {
    const payload: User = {
      ...MOCK_USER,
      avatar: 'test-image.png',
    };

    await test.step('Fill the form with the provided avatar', async () => {
      await userForm.fillForm(payload);

      await userForm.verifyTitle('New users record');
    });

    await test.step('Error message is displayed', async () => {
      await userForm.verifyErrorMessage(/test-image.*mime type must be one of: NO_UPLOADS_ALLOWED/);
      await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_CREATE_RECORD);
    });
  });

  const INVALID_FIELD_CASES = [
    {
      field: 'username',
      title: 'Failure when typing a username of less than 3 characters',
      payload: {
        ...MOCK_USER,
        username: 'lo',
      },
      message: MESSAGES.LIMIT_CHARACTERS(),
    },
    {
      field: 'username',
      title: 'Failure when typing the wrong username',
      payload: {
        ...MOCK_USER,
        username: 'lorem lorem',
      },
      message: MESSAGES.INVALID_FORMAT,
    },
    {
      field: 'email',
      title: 'Failure when typing a wrong format email',
      payload: {
        ...MOCK_USER,
        email: 'test555@g',
      },
      message: MESSAGES.INVALID_EMAIL,
    },
    {
      field: 'id',
      title: 'Failure when typing the wrong format ID',
      payload: {
        ...MOCK_USER,
        id: 'lorem aaaabdada',
      },
      message: MESSAGES.INVALID_FORMAT,
    },
    {
      field: 'email',
      title: 'Failure when the email already exists',
      preStep: true,
      payload: {
        ...MOCK_USER,
        email: 'test10@example.com',
      },
      message: MESSAGES.UNIQUE_VALUE,
    },
  ];

  INVALID_FIELD_CASES.forEach(({ field, message, title, payload, preStep }) => {
    test(title, async ({ page, dashboardPage, userForm, apiContext }) => {
      if (preStep) {
        await test.step('Pre-step fill form with required inputs', async () => {
          await apiContext.post(API_URLS.USER, { data: payload });
        });
      }

      await test.step(`Fill form with invalid ${field}`, async () => {
        const responsePromise = waitForPostResponse({ url: API_URLS.USER, page });
        await userForm.fillForm(payload);

        const response = await responsePromise;
        const responseBody = await response.json();

        await userForm.verifyTitle('New users record');
        expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
        expect(responseBody.data[field]).toBeTruthy();
        expect(responseBody.message).toBe(MESSAGES.FAILED_TO_CREATE_RECORD);
      });

      await test.step('Error message is displayed', async () => {
        await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_CREATE_RECORD);
        await userForm.verifyErrorMessage(message);
      });

      await apiContext.delete(`${API_URLS.USER}/${payload.id}`);
    });
  });
});
