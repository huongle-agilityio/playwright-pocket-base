// Fixtures
import { expect, Given, When, Then } from '@/fixtures';

// Constants
import { STATUS_CODES } from '@/constants';

// Interfaces
import { Table, User } from '@/interfaces';

// Utils
import { waitForGetResponse } from '@/utils';

let expectedSorted: string[] = [];
let responseData: User[] = [];
let responseStatus: number;

Given('I am on the dashboard page', async ({ dashboardPage }) => {
  await dashboardPage.goto();
});

Given(
  'the mock data is prepared for column {string}',
  async ({ sortUserMocking }, columnName: keyof Table) => {
    expectedSorted = sortUserMocking
      .map((u) => u[columnName as keyof User])
      .filter((val): val is string => typeof val === 'string')
      .sort()
      .reverse();
  },
);

When('I click the {string} column header', async ({ page, tablePage }, columnName: keyof Table) => {
  const responsePromise = waitForGetResponse({ url: `sort=-${columnName}`, page });
  await tablePage.getColumn(columnName).click();

  const response = await responsePromise;
  responseData = (await response.json()).items;
  responseStatus = response.status();
});

Then('the request should be sent with sort param {string}', async () => {
  expect(responseStatus).toBe(STATUS_CODES.SUCCESS);
});

Then(
  'the response data should match the sorted {string} values',
  async ({}, columnName: keyof Table) => {
    const data = responseData
      .map((item) => item[columnName])
      .filter((val): val is string => typeof val === 'string' && expectedSorted.includes(val));

    expect(data).toEqual(expectedSorted);
  },
);

Then(
  'the table should be sorted by {string} in descending order',
  async ({ tablePage }, columnName: keyof Table) => {
    await tablePage.waitForTableToLoad();
    const values = await tablePage.getAllValueCellByColumnName(columnName);
    const filteredValues = values.filter((item) => expectedSorted.includes(item));
    expect(filteredValues).toEqual(expectedSorted);
  },
);
