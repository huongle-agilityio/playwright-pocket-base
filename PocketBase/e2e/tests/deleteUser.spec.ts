import { expect, test } from '@/fixtures';

// Constants
import { MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import {
  createMockUsers,
  deleteMockUsers,
  waitForDeleteMultipleResponse,
  waitForDeleteResponse,
  generateMockUsers,
} from '@/utils';

test.describe('Delete user', () => {
  const mocks = generateMockUsers();

  test.beforeEach(async ({ dashboardPage, searchInput }) => {
    await dashboardPage.goto();
    await createMockUsers(mocks);

    if (await searchInput.clearButton.isVisible()) {
      await searchInput.clickClearButton();
    }
  });

  test.afterEach(async ({ tablePage }) => {
    await tablePage.waitForTableToLoad();

    await deleteMockUsers({ tablePage, users: mocks });
  });

  test('Verify that user can delete single item', async ({ dashboardPage, tablePage, page }) => {
    await test.step('Click checkbox to select user', async () => {
      await dashboardPage.goto();
      await tablePage.selectRowByValue({ columnName: 'email', value: mocks[0].email });
    });

    await test.step('Verify that response status is no content', async () => {
      const responsePromise = waitForDeleteResponse({ page, id: mocks[0].id });

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();

      const response = await responsePromise;
      expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
    });

    await test.step('Verify user row is removed & toast appears', async () => {
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_DELETED_RECORD);
      await expect(async () => {
        const row = await tablePage.getRowByValue({
          columnName: 'email',
          value: mocks[0].email,
          requireVisible: false,
        });
        const count = await row.count();
        expect(count).toBe(0);
      }).toPass({ timeout: 5000 });
    });
  });

  test('Verify that user can delete multiple items', async ({ dashboardPage, tablePage, page }) => {
    const targetNames = [mocks[0].id, mocks[1].id];

    await test.step('Click checkbox to select user', async () => {
      await dashboardPage.goto();
      await tablePage.selectMultipleRowsByValue({
        columnName: 'id',
        targetNames,
      });
    });

    await test.step('Verify that response status is no content', async () => {
      const responsePromises = targetNames.map((id) => waitForDeleteResponse({ page, id }));

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();

      const responses = await Promise.all(responsePromises);
      for (const response of responses) {
        expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
      }
    });

    await test.step('Verify user row is removed & toast appears', async () => {
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

  test.skip('Verify that user can delete all items', async ({ dashboardPage, tablePage, page }) => {
    await test.step('Click the checkbox on the header to select all users', async () => {
      await dashboardPage.goto();
      await tablePage.selectAllRows();
    });

    await test.step('Confirm delete all users', async () => {
      const deleteResponsePromises = Promise.all(
        Array.from({ length: mocks.length }).map(() => waitForDeleteMultipleResponse({ page })),
      );

      await dashboardPage.deleteSelected();
      await dashboardPage.submitConfirmModal();
      await deleteResponsePromises;
    });

    await test.step('Verify empty table and toast appears', async () => {
      await tablePage.waitForTableToLoad();
      await dashboardPage.verifyToastMessage(MESSAGES.SUCCESSFULLY_DELETED_MULTIPLE_RECORDS);
      await tablePage.buttonClearFilters().isVisible();
      await tablePage.verifyMessage('No records found.');
    });
  });

  test('Verify that user can unselect item delete in the table', async ({
    dashboardPage,
    tablePage,
  }) => {
    await test.step('Click the checkbox on the header to select all users', async () => {
      await dashboardPage.goto();
      const checkbox = await tablePage.selectRowByValue({
        columnName: 'email',
        value: mocks[0].email,
      });

      await expect(dashboardPage.verifyNumberOfRecordsSelected(1)).toBeVisible();
      expect(await checkbox.isChecked()).toBe(true);
    });

    await test.step('Confirm delete all users', async () => {
      const checkbox = await tablePage.selectRowByValue({
        columnName: 'email',
        value: mocks[0].email,
      });
      await expect(dashboardPage.verifyNumberOfRecordsSelected(1)).toHaveCount(0);
      expect(await checkbox.isChecked()).toBe(false);
    });
  });

  test('Verify that user can unselect item delete with the button reset', async ({
    dashboardPage,
    tablePage,
  }) => {
    const targetNames = [mocks[0].id, mocks[1].id];

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

    await test.step('Confirm delete all users', async () => {
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
