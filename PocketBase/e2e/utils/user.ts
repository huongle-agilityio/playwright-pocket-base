import { APIRequestContext, expect } from '@playwright/test';

// Components
import { TablePage } from '@/components';

// Constants
import { API_URLS, STATUS_CODES } from '@/constants';

// Interfaces
import { User } from '@/interfaces';

/**
 * Generates a random 15-character alphanumeric string to use as a user ID.
 * @returns The generated user ID.
 */
export const generateUserId = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return id;
};

/**
 * Generates an array of User objects with the given prefixes.
 *
 * @param prefixes - An array of strings to use as prefixes for the user's information.
 * @returns An array of User objects with randomly generated information.
 */
export const generateMockUsers = (prefixes = ['test1', 'test2', 'test33']): User[] => {
  return prefixes.map((prefix) => {
    const id = generateUserId();

    return {
      id,
      email: `${prefix}_${id}@gmail.com`,
      password: 'Test123@',
      passwordConfirm: 'Test123@',
      isVerified: Math.random() < 0.5,
      isEmailVisibility: Math.random() < 0.5,
      username: `${prefix}${id}`,
      name: `${prefix}${id}`,
      website: `https://${prefix}_${id}.com`,
    };
  });
};

/**
 * Deletes a user from the database.
 *
 * @param {TablePage} tablePage - The TablePage object for interacting with the table.
 * @param {User} user - The user to delete.
 * @param {APIRequestContext} context - The APIRequestContext for making the request.
 */
export const deleteAnUser = async ({
  tablePage,
  user,
  context,
}: {
  tablePage: TablePage;
  user: User;
  context: APIRequestContext;
}) => {
  const row = await tablePage.getRowByValue({
    columnName: 'id',
    value: user.id,
    requireVisible: false,
  });
  const count = await row.count();

  if (count > 0) {
    const response = await context.delete(`${API_URLS.USER}/${user.id}`);
    expect(response.status()).toBe(STATUS_CODES.NO_CONTENT);
  }
};

/**
 * Deletes the given users from the database.
 *
 * @param {TablePage} tablePage - The TablePage object for interacting with the table.
 * @param {User[]} users - The array of users to delete.
 */
export const deleteMockUsers = async ({
  tablePage,
  users,
  context,
}: {
  tablePage: TablePage;
  users: User[];
  context: APIRequestContext;
}) => {
  for (const user of users) {
    await deleteAnUser({ tablePage, user, context });
  }
};

/**
 * Creates the given users in the database.
 *
 * @param {User[]} The array of users to create.
 */
export const createMockUsers = async ({
  users,
  context,
}: {
  users: User[];
  context: APIRequestContext;
}) => {
  for (const user of users) {
    const response = await context.post(API_URLS.USER, { data: user });
    expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  }
};

/**
 * Creates and manages a fixture for mock user data.
 *
 * This function generates mock users with the given usernames, creates them in the database,
 * and ensures they are deleted after use. It is useful for testing scenarios where temporary
 * user data is needed.
 *
 * @param userNames - An array of strings representing the usernames to be used for generating mock users.
 */
export const createUserMockFixture = (userNames: string[]) => {
  return async ({ apiContext, dashboardPage, tablePage }, use) => {
    const mocks = generateMockUsers(userNames);

    await dashboardPage.goto();
    await createMockUsers({ users: mocks, context: apiContext });
    await use(mocks);
    await tablePage.waitForTableToLoad();
    await deleteMockUsers({ tablePage, users: mocks, context: apiContext });
  };
};
