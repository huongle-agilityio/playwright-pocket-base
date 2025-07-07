import { expect, test } from '@/fixtures';

// Constants
import { API_URLS, MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import { createMockUsers, deleteMockUsers, generateMockUsers, generateUserId } from '@/utils';

test.describe('Edit user', { tag: '@private' }, () => {
  const mocks = generateMockUsers();

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await createMockUsers(mocks);
  });

  test.afterEach(async ({ tablePage }) => {
    await deleteMockUsers({ tablePage, users: mocks });
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
        row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
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
          res.url().includes(`${API_URLS.USER}/${mocks[1].id}`) &&
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
        row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
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
    const newEmail = mocks[0].email;

    await test.step('Verify that the user can see the user in the table', async () => {
      await expect(async () => {
        await dashboardPage.goto();
        row = await tablePage.getRowByValue({ columnName: 'email', value: mocks[1].email });
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
          res.url().includes(`${API_URLS.USER}/${mocks[1].id}`) &&
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
