// Fixtures
import { expect, Given, Then, When } from '@/fixtures';

// Constants
import { MESSAGES, STATUS_CODES } from '@/constants';

// Utils
import { generateUserId, waitForPatchResponse } from '@/utils';

let row;
let response;
let responseBody;
let responsePromise;
let newEmail = '';

// Scenario: Successfully update the user with selected email
Given('I saw the user in the table', async ({ dashboardPage, tablePage, editUserMocking }) => {
  await dashboardPage.goto();
  row = await tablePage.getRowByValue({ columnName: 'email', value: editUserMocking[1].email });
  await expect(row).toBeVisible();
});

When('I select the user to edit', async ({ userForm }) => {
  await row.click();
  await userForm.email.click();
});

When(
  'updates the email field with a new email and click "Save" button',
  async ({ page, editUserMocking, userForm }) => {
    newEmail = `test${generateUserId()}@gmail.com`;

    await userForm.verifyTitle('Edit users record');
    responsePromise = waitForPatchResponse({ page, id: editUserMocking[1].id });

    await userForm.email.fill(newEmail);
    await userForm.saveChange();

    response = await responsePromise;
    responseBody = await response.json();
  },
);

Then('the response return has new email', async () => {
  expect(response.status()).toBe(STATUS_CODES.SUCCESS);
  expect(responseBody.email).toBe(newEmail);
});

Then('I can see the user is updated with the new email', async ({ tablePage }) => {
  // Wait for table to reload or changes to reflect
  await expect(async () => {
    const rowData = await tablePage.extractRowData({
      columnName: 'email',
      value: newEmail,
    });
    const { id, email, emailVisibility, verified, username, name, avatar, website } = responseBody;

    expect(rowData).toEqual([
      { id },
      { email },
      { emailVisibility: emailVisibility ? 'True' : 'False' },
      { verified: verified ? 'True' : 'False' },
      { username: username },
      { name: name || 'N/A' },
      { avatar: avatar || 'N/A' },
      { website: website || 'N/A' },
    ]);
  }).toPass({ timeout: 10000 });
});

// Scenario: Successfully update the user and continue editing
When(
  'updates the email field with a new email and click "Save and continue" button',
  async ({ userForm }) => {
    newEmail = `test${generateUserId()}@gmail.com`;

    await userForm.email.fill(newEmail);
    await userForm.saveAndContinue();
  },
);

Then('the edit form is still open', async ({ userForm }) => {
  await userForm.verifyTitle('Edit users record');
});

// Scenario: Failure update if the email already exists
When(
  'updates the email field with an existing email and click "Save" button',
  async ({ page, userForm, editUserMocking }) => {
    const newEmail = editUserMocking[0].email;

    await userForm.verifyTitle('Edit users record');
    const responsePromise = waitForPatchResponse({ page, id: editUserMocking[1].id });

    await userForm.email.fill(newEmail);
    await userForm.saveChange();

    response = await responsePromise;
    responseBody = await response.json();
  },
);

Then('the response is bad request with error message "Failed to update record."', async () => {
  expect(response.status()).toBe(STATUS_CODES.BAD_REQUEST);
  expect(responseBody.message).toBe(MESSAGES.FAILED_TO_UPDATE_RECORD);
  expect(responseBody.data.email).toBeTruthy();
});

Then('the email error message is shown on the form', async ({ userForm }) => {
  await userForm.verifyTitle('Edit users record');
  await userForm.verifyErrorMessage(MESSAGES.UNIQUE_VALUE);
});
