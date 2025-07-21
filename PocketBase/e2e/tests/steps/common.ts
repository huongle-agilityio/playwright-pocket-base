import { Given, Then } from '@/fixtures';

Given('I am on the dashboard page', async ({ dashboardPage }) => {
  await dashboardPage.goto();
});

// Toast message verification
Then('the toast with the message {string} appears', async ({ dashboardPage }, message: string) => {
  await dashboardPage.verifyToastMessage(message);
});
