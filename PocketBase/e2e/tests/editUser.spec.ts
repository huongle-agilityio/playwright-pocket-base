import { expect, test } from '@/fixtures';

// Constants
import { MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import {
  createMockUsers,
  deleteMockUsers,
  generateMockUsers,
  generateUserId,
  waitForPatchResponse,
} from '@/utils';

test.describe('Edit user', () => {
  const mocks = generateMockUsers(['edit1', 'edit2', 'edit3']);

  test.beforeEach(async ({ dashboardPage, apiContext }) => {
    await dashboardPage.goto();
    await createMockUsers({ users: mocks, context: apiContext });
  });

  test.afterEach(async ({ tablePage, apiContext }) => {
    await deleteMockUsers({ tablePage, users: mocks, context: apiContext });
  });

  test('Successfully update the user with selected email', async ({
    tablePage,
    page,
    userForm,
    dashboardPage,
  }) => {
    let row;
    let response;
    let responseBody;
    const newEmail = `test${generateUserId()}@gmail.com`;

    await test.step('The user in the table is visible', async () => {
      await dashboardPage.goto();
      row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
      await expect(row).toBeVisible();
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.verifyTitle('Edit users record');
      const responsePromise = waitForPatchResponse({ page, id: mocks[1].id });

      await userForm.email.fill(newEmail);
      await userForm.saveChange();
      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('The the selected email is updated and success message is displayed', async () => {
      expect(response.status()).toBe(STATUS_CODES.SUCCESS);
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_UPDATED_RECORD);
      expect(responseBody.email).toBe(newEmail);

      // Wait for table to reload or changes to reflect
      await expect(async () => {
        const rowData = await tablePage.extractRowData({
          columnName: 'email',
          value: newEmail,
        });
        const { id, email, emailVisibility, verified, username, name, avatar, website } =
          responseBody;

        expect(rowData).toEqual([
          { id },
          { email },
          { emailVisibility: emailVisibility ? 'True' : 'False' },
          { verified: verified ? 'True' : 'False' },
          { username: username },
          { name: name || 'N/A' },
          { avatar: avatar || 'N/A' },
          { website: website || 'N/A' },
        ]);
      }).toPass({ timeout: 10000 });
    });
  });

  test('Successfully update the user with the selected, and continue updating', async ({
    tablePage,
    userForm,
    dashboardPage,
  }) => {
    let row;
    const newEmail = `test${generateUserId()}@gmail.com`;

    await test.step('The user in the table is visible', async () => {
      await dashboardPage.goto();
      row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
      await expect(row).toBeVisible();
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.email.fill(newEmail);
      await userForm.saveAndContinue();
    });

    await test.step('The the selected email is updated and success message is displayed', async () => {
      await userForm.verifyTitle('Edit users record');
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_UPDATED_RECORD);
      const updatedRow = await tablePage.getRowByValue({
        columnName: 'email',
        value: newEmail,
      });
      await expect(updatedRow).toBeVisible();
    });
  });

  test('Failure update email if the email already exist', async ({
    tablePage,
    page,
    userForm,
    dashboardPage,
  }) => {
    let row;
    let response;
    let responseBody;
    const newEmail = mocks[0].email;

    await test.step('The user in the table is visible', async () => {
      await dashboardPage.goto();
      row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
      await expect(row).toBeVisible();
    });

    await test.step('Click user row to edit', async () => {
      await row.click();
      await userForm.email.click();
    });

    await test.step('Update email', async () => {
      await userForm.verifyTitle('Edit users record');
      const responsePromise = waitForPatchResponse({ page, id: mocks[1].id });

      await userForm.email.fill(newEmail);
      await userForm.saveChange();
      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('Error message is displayed and response status code is Bad Request', async () => {
      await userForm.verifyTitle('Edit users record');
      expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
      await userForm.verifyErrorMessage(MESSAGES.UNIQUE_VALUE);
      await dashboardPage.verifyToastMessage(MESSAGES.FAILED_TO_UPDATE_RECORD);
      expect(responseBody.message).toBe(MESSAGES.FAILED_TO_UPDATE_RECORD);
      expect(responseBody.data.email).toBeTruthy();
    });
  });
});
