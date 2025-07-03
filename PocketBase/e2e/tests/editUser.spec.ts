import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import { createApiContext, generateUserId } from '@/utils';

const USERS = ['test1', 'test2'].map((prefix) => ({
  id: generateUserId(),
  email: `${prefix}_${generateUserId()}}@gmail.com`,
  password: 'Test123@',
  passwordConfirm: 'Test123@',
}));

test.describe('Edit user', { tag: '@private' }, () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();

    const context = await createApiContext();
    for (const user of USERS) {
      const response = await context.post(API_URLS.USER, { data: user });
      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
    }

    await context.dispose();
  });

  test.afterEach(async () => {
    const context = await createApiContext();
    for (const user of USERS) {
      const response = await context.delete(`${API_URLS.USER}/${user.id}`);
      expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
    }

    await context.dispose();
  });

  test('Verify that the user can update the email of the item they selected', async ({
    tablePage,
    page,
    userForm,
    dashboardPage,
  }) => {
    let row;
    let response;
    let responseBody;
    const newEmail = `test${generateUserId()}@gmail.com`;

    await test.step('Verify that the user can see the user in the table', async () => {
      await expect(async () => {
        await dashboardPage.goto();
        row = await tablePage.getRowByValue({ columnName: 'email', value: USERS[1].email });
        expect(row).toBeVisible();
      }).toPass({ timeout: 5000 });
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.verifyTitle('Edit users record');
      const responsePromise = page.waitForResponse(
        (res) =>
          res.url().includes(`${API_URLS.USER}/${USERS[1].id}`) &&
          res.request().method() === 'PATCH',
      );
      await userForm.email.fill(newEmail);
      await userForm.saveChange();
      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('Verify that the email is updated', async () => {
      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_UPDATED_RECORD);
      expect(responseBody.email).toBe(newEmail);

      // Wait for table to reload or changes to reflect
      await expect(async () => {
        const rowData = await tablePage.extractRowData({
          columnName: 'email',
          value: newEmail,
        });

        expect(rowData).toEqual([
          { id: responseBody.id },
          { email: responseBody.email },
          { emailVisibility: responseBody.emailVisibility ? 'True' : 'False' },
          { verified: responseBody.verified ? 'True' : 'False' },
          { username: responseBody.username },
          { name: responseBody.name || 'N/A' },
          { avatar: responseBody.avatar || 'N/A' },
          { website: responseBody.website || 'N/A' },
        ]);
      }).toPass({ timeout: 5000 });
    });
  });

  test('Verify that the user can update the email of the item they selected and stay in the modal to continue updating', async ({
    tablePage,
    userForm,
    dashboardPage,
  }) => {
    let row;
    const newEmail = `test${generateUserId()}@gmail.com`;

    await test.step('Verify that the user can see the user in the table', async () => {
      await expect(async () => {
        await dashboardPage.goto();
        row = await tablePage.getRowByValue({ columnName: 'email', value: USERS[1].email });
        expect(row).toBeVisible();
      }).toPass({ timeout: 5000 });
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.email.fill(newEmail);
      await userForm.saveAndContinue();
    });

    await test.step('Verify that the email is updated', async () => {
      await userForm.verifyTitle('Edit users record');
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_UPDATED_RECORD);
      const updatedRow = await tablePage.getRowByValue({
        columnName: 'email',
        value: newEmail,
      });
      expect(updatedRow).toBeVisible();
    });
  });

  test("Verify that user can't update email if the email already exist", async ({
    tablePage,
    page,
    userForm,
    dashboardPage,
  }) => {
    let row;
    let response;
    let responseBody;
    const newEmail = USERS[0].email;

    await test.step('Verify that the user can see the user in the table', async () => {
      await expect(async () => {
        await dashboardPage.goto();
        row = await tablePage.getRowByValue({ columnName: 'email', value: USERS[1].email });
        expect(row).toBeVisible();
      }).toPass({ timeout: 5000 });
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.verifyTitle('Edit users record');
      const responsePromise = page.waitForResponse(
        (res) =>
          res.url().includes(`${API_URLS.USER}/${USERS[1].id}`) &&
          res.request().method() === 'PATCH',
      );
      await userForm.email.fill(newEmail);
      await userForm.saveChange();
      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('Verify that the response return error message', async () => {
      await userForm.verifyTitle('Edit users record');
      expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
      await userForm.verifyErrorMessage(MESSAGES.UNIQUE_VALUE);
      await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_UPDATE_RECORD);
      expect(responseBody.message).toBe(MESSAGES.FAILED_TO_UPDATE_RECORD);
      expect(responseBody.data.email).toBeTruthy();
    });
  });
});
