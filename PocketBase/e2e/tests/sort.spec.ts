import { expect, test } from '@/fixtures';

// Constants
import { STATUS_CODES } from '@/constants';

// Interfaces
import { Table, User } from '@/interfaces';

// Utils
import { createMockUsers, deleteMockUsers, generateMockUsers, waitForGetResponse } from '@/utils';

test.describe('Sort', () => {
  const mocks = generateMockUsers(['sort1', 'sort2', 'sort3']);

  test.beforeEach(async ({ dashboardPage, apiContext }) => {
    await dashboardPage.goto();
    await createMockUsers({ users: mocks, context: apiContext });
  });

  test.afterEach(async ({ tablePage, apiContext }) => {
    await deleteMockUsers({ tablePage, users: mocks, context: apiContext });
  });

  const CASES: { columnName: keyof Table }[] = [
    {
      columnName: 'id',
    },
    {
      columnName: 'email',
    },
    {
      columnName: 'emailVisibility',
    },
    {
      columnName: 'username',
    },
    {
      columnName: 'name',
    },
    {
      columnName: 'website',
    },
  ];

  CASES.forEach(({ columnName }) => {
    test(`Verify that the user can sort the ${columnName} column alphabetical order after clicking the column header.`, async ({
      page,
      tablePage,
    }) => {
      let expectedSorted;

      await test.step(`Click on the column ${columnName} on the header and verify that the response list items match with the list items in UI`, async () => {
        const responsePromise = waitForGetResponse({ url: `sort=-${columnName}`, page });

        await tablePage.getColumn(columnName).click();

        const response = await responsePromise;
        const responseBody = await response.json();
        expectedSorted = mocks
          .map((u) => u[columnName as keyof User])
          .sort()
          .reverse();
        const data = responseBody.items
          .map((item) => item[columnName])
          .filter((val): val is string => typeof val === 'string' && expectedSorted.includes(val));

        await expect(tablePage.getColumn(columnName)).toBeVisible();
        expect(response.status()).toBe(STATUS_CODES.SUCCESS);
        expect(data).toEqual(expectedSorted);
      });

      await test.step(`Verify that the ${columnName} column is sorted in alphabetical order`, async () => {
        await tablePage.waitForTableToLoad();
        const values = await tablePage.getAllValueCellByColumnName(columnName);
        const filteredValues = values.filter((item) => expectedSorted.includes(item));

        expect(filteredValues).toEqual(expectedSorted);
      });
    });
  });
});
