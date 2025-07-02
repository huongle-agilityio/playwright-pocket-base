import { Page } from '@playwright/test';

// Pages
import { DashboardPage, UserForm } from '@/pages';

// Constants
import { API_URLS } from '@/constants';

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
export const createUser = async ({
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
