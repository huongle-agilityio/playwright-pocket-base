import { expect, test } from '@/fixtures';

// Constants
import { MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import { waitForDeleteMultipleResponse, waitForDeleteResponse } from '@/utils';

test.describe('Delete user', () => {
  test.beforeEach(async ({ searchInput }) => {
    if (await searchInput.clearButton.isVisible()) {
      await searchInput.clickClearButton();
    }
  });

  test('Successfully delete single user', async ({
    dashboardPage,
    tablePage,
    page,
    deleteUserMocking,
  }) => {
    await test.step('Click checkbox to select user', async () => {
      await dashboardPage.goto();
      await tablePage.selectRowByValue({ columnName: 'email', value: deleteUserMocking[0].email });
    });

    await test.step('API response status is no content', async () => {
      const responsePromise = waitForDeleteResponse({ page, id: deleteUserMocking[0].id });

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();

      const response = await responsePromise;
      expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
    });

    await test.step('User is removed and success message is displayed', async () => {
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_DELETED_RECORD);
      await expect(async () => {
        const row = await tablePage.getRowByValue({
          columnName: 'email',
          value: deleteUserMocking[0].email,
          requireVisible: false,
        });
        const count = await row.count();
        expect(count).toBe(0);
      }).toPass({ timeout: 5000 });
    });
  });

  test('Successfully delete multiple user', async ({
    dashboardPage,
    tablePage,
    page,
    deleteUserMocking,
  }) => {
    const targetNames = [deleteUserMocking[0].id, deleteUserMocking[1].id];

    await test.step('Click checkbox to select user', async () => {
      await dashboardPage.goto();
      await tablePage.selectMultipleRowsByValue({
        columnName: 'id',
        targetNames,
      });
    });

    await test.step('API response status is no content', async () => {
      const responsePromises = targetNames.map((id) => waitForDeleteResponse({ page, id }));

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();

      const responses = await Promise.all(responsePromises);
      for (const response of responses) {
        expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
      }
    });

    await test.step('Users are removed and success message is displayed', async () => {
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_DELETED_MULTIPLE_RECORDS);
      await expect(async () => {
        for (const id of targetNames) {
          const row = await tablePage.getRowByValue({
            columnName: 'id',
            value: id,
            requireVisible: false,
          });
          const count = await row.count();
          expect(count).toBe(0);
        }
      }).toPass({ timeout: 5000 });
    });
  });

  test.skip('Successfully delete all user', async ({
    dashboardPage,
    tablePage,
    page,
    deleteUserMocking,
  }) => {
    await test.step('Click the checkbox on the header to select all users', async () => {
      await dashboardPage.goto();
      await tablePage.selectAllRows();
    });

    await test.step('Confirm delete all users', async () => {
      const deleteResponsePromises = Promise.all(
        Array.from({ length: deleteUserMocking.length }).map(() =>
          waitForDeleteMultipleResponse({ page }),
        ),
      );

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();
      await deleteResponsePromises;
    });

    await test.step('All users are removed and success message is displayed', async () => {
      await tablePage.waitForTableToLoad();
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_DELETED_MULTIPLE_RECORDS);
      await tablePage.buttonClearFilters().isVisible();
      await tablePage.verifyMessage('No records found.');
    });
  });

  test('Successfully unselect user delete in the table', async ({
    dashboardPage,
    tablePage,
    deleteUserMocking,
  }) => {
    await test.step('Click the checkbox on the header to select all users', async () => {
      await dashboardPage.goto();
      const checkbox = await tablePage.selectRowByValue({
        columnName: 'email',
        value: deleteUserMocking[0].email,
      });

      await expect(dashboardPage.verifyNumberOfRecordsSelected(1)).toBeVisible();
      expect(await checkbox.isChecked()).toBe(true);
    });

    await test.step('No users are selected', async () => {
      const checkbox = await tablePage.selectRowByValue({
        columnName: 'email',
        value: deleteUserMocking[0].email,
      });
      await expect(dashboardPage.verifyNumberOfRecordsSelected(1)).toHaveCount(0);
      expect(await checkbox.isChecked()).toBe(false);
    });
  });

  test('Successfully unselect user delete with the button reset', async ({
    dashboardPage,
    tablePage,
    deleteUserMocking,
  }) => {
    const targetNames = [deleteUserMocking[0].id, deleteUserMocking[1].id];

    await test.step('Select multiple users', async () => {
      await dashboardPage.goto();
      const listCheckbox = await tablePage.selectMultipleRowsByValue({
        columnName: 'id',
        targetNames,
      });

      await expect(dashboardPage.verifyNumberOfRecordsSelected(2)).toBeVisible();
      for (const checkbox of listCheckbox) {
        expect(await checkbox.isChecked()).toBe(true);
      }
    });

    await test.step('No users are selected', async () => {
      await dashboardPage.resetSelected();
      await expect(dashboardPage.verifyNumberOfRecordsSelected(2)).toHaveCount(0);

      const listCheckbox = tablePage.getAllCheckbox();
      const count = await listCheckbox.count();
      for (let i = 0; i < count; i++) {
        const checkbox = listCheckbox.nth(i);
        expect(await checkbox.isChecked()).toBe(false);
      }
    });
  });
});
