import { expect, test } from '@/fixtures';

// Constants
import { STATUS_CODES } from '@/constants';

// Utils
import { createMockUsers, deleteMockUsers, generateMockUsers } from '@/utils';

test.describe('Search', { tag: '@private' }, () => {
  const mocks = generateMockUsers();

  test.beforeEach(async ({ dashboardPage, searchInput }) => {
    await dashboardPage.goto();
    await createMockUsers(mocks);

    if (await searchInput.clearButton.isVisible()) {
      await searchInput.clickClearButton();
    }
  });

  test.afterEach(async ({ tablePage }) => {
    await deleteMockUsers({ tablePage, users: mocks });
  });

  test('Verify that the user can search users with a matching email', async ({
    page,
    searchInput,
    tablePage,
  }) => {
    let response;
    let responseBody;
    const searchValue = mocks[1].email;

    await test.step('Trigger search and wait for response', async () => {
      const responsePromise = page.waitForResponse((res) => {
        const decodedURL = decodeURIComponent(res.url());

        return (
          decodedURL.includes(`filter=id~"${searchValue}"`) &&
          !decodedURL.includes('fields=id') &&
          res.request().method() === 'GET'
        );
      });

      // Trigger search and input check together with retry
      await expect(async () => {
        await searchInput.search(searchValue);
        await searchInput.verifySearchInputValue(searchValue);
      }).toPass({ timeout: 5000 });

      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('Wait for table to load and verify content', async () => {
      await expect(async () => {
        const userRow = await tablePage.extractRowData({
          columnName: 'email',
          value: searchValue,
        });

        expect(response.status()).toBe(STATUS_CODES.SUCCESS);
        expect(responseBody.items.length).toBe(1);
        expect(userRow).toEqual([
          { id: responseBody.items[0].id },
          { email: responseBody.items[0].email },
          { emailVisibility: responseBody.items[0].emailVisibility ? 'True' : 'False' },
          { verified: responseBody.items[0].verified ? 'True' : 'False' },
          { username: responseBody.items[0].username },
          { name: responseBody.items[0].name || 'N/A' },
          { avatar: responseBody.items[0].avatar || 'N/A' },
          { website: responseBody.items[0].website || 'N/A' },
        ]);
      }).toPass({ timeout: 5000 });
    });
  });

  test('Verify that the user can search users with half of the matching text', async ({
    searchInput,
    tablePage,
  }) => {
    const searchValue = 'test';

    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('Verify still have user matched with half of the matching text', async () => {
      const rows = await tablePage.getAllRowsByValue({ columnName: 'email', value: searchValue });

      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(searchValue);
      }
    });
  });

  test('Verify that the user can search for users with the unmatched text', async ({
    searchInput,
    tablePage,
  }) => {
    const searchValue = 'lorem';
    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('Verify no user matched', async () => {
      await tablePage.waitForTableToLoad();
      expect(await tablePage.getLength()).toBe(0);
      await tablePage.verifyMessage('No records found.');
      await expect(tablePage.buttonClearFilters()).toBeVisible();
    });
  });

  test('Verify user can see all users when clicking the clear button in the table', async ({
    searchInput,
    tablePage,
  }) => {
    const searchValue = 'lorem';
    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('Clear filters with the clear button in the table', async () => {
      await tablePage.waitForTableToLoad();
      await tablePage.buttonClearFilters().click();
      await expect(searchInput.input).not.toHaveText(searchValue);
    });

    await test.step('Verify user can see all users', async () => {
      expect(await tablePage.getLength()).toBeGreaterThan(0);
      await expect(tablePage.buttonClearFilters()).not.toBeVisible();
    });
  });
});
