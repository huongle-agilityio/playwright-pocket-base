import { Given } from '@/fixtures';

Given('I am on the dashboard page', async ({ dashboardPage }) => {
  await dashboardPage.goto();
});
