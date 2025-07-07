import { APIRequestContext, expect, Page } from '@playwright/test';
import { createApiContext } from './apis';

// Pages
import { DashboardPage, TablePage, UserForm } from '@/pages';

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
 * Creates a new user by filling out the user form and waits for the user creation API response.
 *
 * @param page - The Playwright Page object used to interact with the browser.
 * @param userForm - The UserForm object for interacting with the user form.
 * @param dashboardPage - The DashboardPage object for interacting with the dashboard.
 * @param user - The User object containing the user's information to fill out the form.
 * @returns A promise that resolves when the form is submitted and the API response is received.
 */
export const submitUserForm = async ({
  page,
  userForm,
  user,
}: {
  page: Page;
  userForm: UserForm;
  dashboardPage: DashboardPage;
  user: User;
}) =>
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes(API_URLS.USER) && res.request().method() === 'POST',
    ),
    userForm.fillForm(user),
  ]);

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
 * @param {{ tablePage: TablePage, user: User, context: APIRequestContext }} options - Options object
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
}: {
  tablePage: TablePage;
  users: User[];
}) => {
  const context = await createApiContext();
  for (const user of users) {
    await deleteAnUser({ tablePage, user, context });
  }

  await context.dispose();
};

/**
 * Creates the given users in the database.
 *
 * @param {User[]} The array of users to create.
 */
export const createMockUsers = async (users: User[]) => {
  const context = await createApiContext();
  for (const user of users) {
    const response = await context.post(API_URLS.USER, { data: user });
    expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  }

  await context.dispose();
};
