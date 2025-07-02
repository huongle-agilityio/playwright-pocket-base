import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES } from '@/constants';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { createUser, generateUserId } from '@/utils';

const USER = {
  id: generateUserId(),
  email: `test${generateUserId()}@gmail.com`,
  password: 'test123@',
  passwordConfirm: 'test123@',
};

const INVALID_FIELD_CASES = [
  {
    field: 'username',
    title:
      "Verify that the user can't create a new user when typing a username of less than 3 characters",
    payload: {
      ...USER,
      username: 'lo',
    },
    message: MESSAGES.LIMIT_CHARACTERS(),
  },
  {
    field: 'username',
    title: "Verify that the user can't create a new user when typing the wrong username",
    payload: {
      ...USER,
      username: 'lorem lorem',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  {
    field: 'email',
    title: "Verify that the user can't create a new user when typing a wrong format email",
    payload: {
      ...USER,
      email: 'test555@g',
    },
    message: MESSAGES.INVALID_EMAIL,
  },
  {
    field: 'id',
    title: "Verify that the user can't create a new user when typing the wrong format ID",
    payload: {
      ...USER,
      id: 'lorem aaaabdada',
    },
    message: MESSAGES.INVALID_FORMAT,
  },
  {
    field: 'email',
    title: "Verify that the user can't create a user when the email already exists",
    preStep: true,
    payload: {
      ...USER,
      email: 'test10@example.com',
    },
    message: MESSAGES.UNIQUE_VALUE,
  },
];

test.describe(
  'Add new user',
  {
    tag: '@private',
  },
  () => {
    test.beforeEach(async ({ dashboardPage, userForm }) => {
      await dashboardPage.goto();
      await dashboardPage.clickAddNew();
      await userForm.verifyTitle();
    });

    test.afterEach(async ({ page, request }) => {
      await page.waitForTimeout(1000);

      const userLocator = page.frameLocator('iframe').getByRole('cell', {
        name: `Copy to clipboard ${USER.id}`,
      });
      const count = await userLocator.count();

      if (count > 0) {
        const response = await request.delete(`${API_URLS.USER}/${USER.id}`);
        expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
      }
    });

    test("Verify that the user can't create user with empty inputs", async ({ userForm }) => {
      await test.step('Submit form with empty inputs', async () => {
        await userForm.submit();
      });

      await test.step('Verify that the form is not closed', async () => {
        await userForm.verifyTitle();
      });
    });

    test('Verify that the user can leave the form while the form has values', async ({
      userForm,
    }) => {
      await test.step('Cancel form with filled inputs', async () => {
        await userForm.email.fill(USER.email);
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
      userTable,
    }) => {
      await test.step('Fill form with required inputs', async () => {
        const [response] = await createUser({ page, userForm, dashboardPage, user: USER });
        const responseBody = await response.json();

        await test.step('Verify returned data matches input', async () => {
          expect(response.status()).toBe(STATUS_CODES.SUCCESS);
          expect(responseBody.email).toBe(USER.email);
          expect(responseBody.id).toBe(USER.id);
        });
      });

      await test.step('Verify toast message and user appear in the table', async () => {
        await userTable.verifyUserRow(USER);
        await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_CREATED_RECORD);
      });
    });

    test('Verify that the user can add a new user by filling in all the inputs', async ({
      dashboardPage,
      userForm,
      userTable,
    }) => {
      const payload: User = {
        ...USER,
        isVerified: true,
        name: 'lorem',
        username: 'lorem',
        website: 'https://example.com',
      };

      await test.step('Fill form with all inputs expect avatar', async () => {
        await userForm.fillForm(payload);
      });

      await test.step('Verify toast message and user appear in the table', async () => {
        await userTable.verifyUserRow(payload);
        await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_CREATED_RECORD);
      });
    });

    test(`Verify that the user can't upload an avatar after clicking the button Create`, async ({
      dashboardPage,
      userForm,
    }) => {
      const payload: User = {
        ...USER,
        avatar: 'test-image.png',
      };

      await test.step('Fill form with all inputs expect avatar', async () => {
        await userForm.fillForm(payload);

        await userForm.verifyTitle();
      });

      await test.step('Verify error messages', async () => {
        await userForm.verifyErrorMessage(
          /test-image.*mime type must be one of: NO_UPLOADS_ALLOWED/,
        );
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

        await test.step(`Fill form with invalid ${field}`, async () => {
          const [response] = await createUser({ page, userForm, dashboardPage, user: payload });
          const responseBody = await response.json();

          await test.step('Verify that the response return error message', async () => {
            await userForm.verifyTitle();
            expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
            expect(responseBody.data[field]).toBeTruthy();
            expect(responseBody.message).toBe(MESSAGES.FAILED_TO_CREATE_RECORD);
          });
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
  },
);
