import { expect, test } from '@/fixtures';

// Constants
import { STATUS_CODES } from '@/constants';

// Utils
import { waitForGetResponse } from '@/utils';

test.describe('Search', () => {
  test('Successfully search users with a matching email', async ({
    page,
    searchInput,
    tablePage,
    searchUserMocking,
  }) => {
    let response;
    let responseBody;
    const searchValue = searchUserMocking[1].email;

    await test.step('Trigger search and wait for response', async () => {
      const responsePromise = waitForGetResponse({ url: `filter=id~"${searchValue}"`, page });

      // Trigger search and input check together with retry
      await expect(async () => {
        await searchInput.search(searchValue);
        await searchInput.verifySearchInputValue(searchValue);
      }).toPass({ timeout: 5000 });

      response = await responsePromise;
      responseBody = await response.json();
    });

    await test.step('The user with the matching text appears', async () => {
      await expect(async () => {
        const userRow = await tablePage.extractRowData({
          columnName: 'email',
          value: searchValue,
        });
        const { id, email, emailVisibility, verified, username, name, avatar, website } =
          responseBody.items[0];

        expect(response.status()).toBe(STATUS_CODES.SUCCESS);
        expect(responseBody.items.length).toBe(1);
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

    await searchInput.clickClearButton();
  });

  test('Successfully search with half of the matching text', async ({
    searchInput,
    tablePage,
    searchUserMocking,
  }) => {
    void searchUserMocking;
    const searchValue = 'search';

    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('The user with the matching text appears', async () => {
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

    await searchInput.clickClearButton();
  });

  test('Successfully search for users with the unmatched text', async ({
    searchInput,
    tablePage,
    searchUserMocking,
  }) => {
    void searchUserMocking;

    const searchValue = 'lorem';
    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('No user appears in the table', async () => {
      await tablePage.waitForTableToLoad();
      expect(await tablePage.getLength()).toBe(0);
      await tablePage.verifyMessage('No records found.');
      await expect(tablePage.buttonClearFilters()).toBeVisible();
    });

    await searchInput.clickClearButton();
  });

  test('Successfully clear filters when clicking the clear button', async ({
    searchInput,
    tablePage,
    searchUserMocking,
  }) => {
    void searchUserMocking;

    const searchValue = 'lorem';
    await test.step('Search for a user', async () => {
      await searchInput.search(searchValue);
    });

    await test.step('Clear filters with the clear button', async () => {
      await tablePage.waitForTableToLoad();
      await tablePage.buttonClearFilters().click();
      await expect(searchInput.input).not.toHaveText(searchValue);
    });

    await test.step('All users appear in the table', async () => {
      expect(await tablePage.getLength()).toBeGreaterThan(0);
      await expect(tablePage.buttonClearFilters()).not.toBeVisible();
    });
  });
});
