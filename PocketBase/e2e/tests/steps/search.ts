import type { Response } from '@playwright/test';
import { expect, Then, When } from '@/fixtures';

// Constants
import { STATUS_CODES } from '@/constants';

// Interfaces
import { Table } from '@/interfaces';

// Utils
import { waitForGetResponse } from '@/utils';

let response: Response;
let responseBody: { items: Table[] };
let searchValue: string;

When('I search with a full matching email', async ({ page, searchInput, searchUserMocking }) => {
  searchValue = searchUserMocking[1].email;

  const responsePromise = waitForGetResponse({ url: `filter=id~"${searchValue}"`, page });

  await expect(async () => {
    await searchInput.search(searchValue);
    await searchInput.verifySearchInputValue(searchValue);
  }).toPass({ timeout: 5000 });

  response = await responsePromise;
  responseBody = await response.json();
});

When('I search with a partial email', async ({ searchInput, searchUserMocking }) => {
  void searchUserMocking;
  searchValue = 'search';
  await searchInput.search(searchValue);
});

When('I search with an unmatched keyword', async ({ searchInput, searchUserMocking }) => {
  void searchUserMocking;
  searchValue = 'lorem';
  await searchInput.search(searchValue);
});

Then('only the matching user should appear in the table', async ({ tablePage }) => {
  await expect(async () => {
    const userRow = await tablePage.extractRowData({
      columnName: 'email',
      value: searchValue,
    });
    const { id, email, emailVisibility, verified, username, name, avatar, website } =
      responseBody.items[0];

    expect(userRow).toEqual([
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

Then('the request should be sent successfully', async ({}) => {
  expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  expect(responseBody.items.length).toBe(1);
});

Then('multiple matching users should appear in the table', async ({ tablePage }) => {
  const rows = await tablePage.getMultipleRowsByValue({
    columnName: 'email',
    value: searchValue,
  });

  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i)).toContainText(searchValue);
  }
});

Then(
  'no user should appear and the "No records found." message is shown',
  async ({ tablePage }) => {
    await tablePage.waitForTableToLoad();
    expect(await tablePage.getLength()).toBe(0);
    await tablePage.verifyMessage('No records found.');
    await expect(tablePage.buttonClearFilters()).toBeVisible();
  },
);

Then('I click the clear filters button', async ({ tablePage, searchInput }) => {
  await tablePage.waitForTableToLoad();
  await tablePage.buttonClearFilters().click();
  await expect(searchInput.input).not.toHaveText(searchValue);
});

Then('all users should reappear in the table', async ({ tablePage }) => {
  expect(await tablePage.getLength()).toBeGreaterThan(0);
  await expect(tablePage.buttonClearFilters()).not.toBeVisible();
});

Then('the search input should be empty', async ({ searchInput }) => {
  await searchInput.clickClearButton();
});
