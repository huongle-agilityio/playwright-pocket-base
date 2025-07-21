// Fixtures
import { STATUS_CODES } from '@/constants';
import { expect, Given, Then, When } from '@/fixtures';
import { waitForDeleteResponse } from '@/utils';

let response;
let responses = [];
let targetNames;

// Scenario: Successfully delete single user
Given('I clear the search input if needed', async ({ searchInput }) => {
  if (await searchInput.clearButton.isVisible()) {
    await searchInput.clickClearButton();
  }
});

When(
  'I select the user by clicking checkbox',
  async ({ dashboardPage, tablePage, deleteUserMocking }) => {
    await dashboardPage.goto();
    await tablePage.selectRowByValue({ columnName: 'email', value: deleteUserMocking[0].email });
  },
);

When(
  'I click the delete button and confirm to delete the user',
  async ({ page, deleteUserMocking, dashboardPage }) => {
    const responsePromise = waitForDeleteResponse({ page, id: deleteUserMocking[0].id });

    await dashboardPage.deleteSelected();
    await dashboardPage.submitConfirmModal();

    response = await responsePromise;
  },
);

Then('the response status should be {string}', () => {
  expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
});

Then('the toast with message {string}', async ({ dashboardPage }, message: string) => {
  await dashboardPage.verifyToastMessage(message);
});

Then(
  'the user row should not be visible in the table',
  async ({ tablePage, deleteUserMocking }) => {
    await expect(async () => {
      const row = await tablePage.getRowByValue({
        columnName: 'email',
        value: deleteUserMocking[0].email,
        requireVisible: false,
      });
      const count = await row.count();
      expect(count).toBe(0);
    }).toPass({ timeout: 5000 });
  },
);

// Scenario: Successfully delete multiple users
When(
  'I select multiple users by clicking the checkbox',
  async ({ dashboardPage, tablePage, deleteUserMocking }) => {
    targetNames = [deleteUserMocking[0].id, deleteUserMocking[1].id];

    await dashboardPage.goto();
    const listCheckbox = await tablePage.selectMultipleRowsByValue({
      columnName: 'id',
      targetNames,
    });

    for (const checkbox of listCheckbox) {
      expect(await checkbox.isChecked()).toBe(true);
    }
  },
);

When(
  'I click the delete button and confirm delete multiple users',
  async ({ page, dashboardPage }) => {
    const responsePromises = targetNames.map((id) => waitForDeleteResponse({ page, id }));

    await dashboardPage.deleteSelected();
    await dashboardPage.submitConfirmModal();

    responses = await Promise.all(responsePromises);
  },
);

Then('the response status for each deletion should be {string}', () => {
  for (const response of responses) {
    expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
  }
});

Then('the selected rows should not be visible in the table', async ({ tablePage }) => {
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

// Scenario: Unselect user delete in the table
When(
  'I click the checkbox to select a user',
  async ({ dashboardPage, tablePage, deleteUserMocking }) => {
    await dashboardPage.goto();
    const checkbox = await tablePage.selectRowByValue({
      columnName: 'email',
      value: deleteUserMocking[0].email,
    });

    expect(await checkbox.isChecked()).toBe(true);
  },
);

Then('I should see 1 record selected', async ({ dashboardPage }) => {
  await expect(dashboardPage.verifyNumberOfRecordsSelected(1)).toBeVisible();
});

When('I unselect the same row', async ({ tablePage, deleteUserMocking }) => {
  const checkbox = await tablePage.selectRowByValue({
    columnName: 'email',
    value: deleteUserMocking[0].email,
  });

  expect(await checkbox.isChecked()).toBe(false);
});

Then(
  'I should see {int} records selected \\(after {int} selected)',
  async ({ dashboardPage }, current: number, previous: number) => {
    await expect(dashboardPage.verifyNumberOfRecordsSelected(previous)).toHaveCount(current);
  },
);

// Scenario: Unselect users using reset button
Then('I should see 2 records selected', async ({ dashboardPage }) => {
  await expect(dashboardPage.verifyNumberOfRecordsSelected(2)).toBeVisible();
});

When('I click the reset button', async ({ dashboardPage }) => {
  await dashboardPage.resetSelected();
});

Then('all checkboxes should be unchecked', async ({ tablePage }) => {
  const listCheckbox = tablePage.getAllCheckbox();
  const count = await listCheckbox.count();
  for (let i = 0; i < count; i++) {
    const checkbox = listCheckbox.nth(i);
    expect(await checkbox.isChecked()).toBe(false);
  }
});
