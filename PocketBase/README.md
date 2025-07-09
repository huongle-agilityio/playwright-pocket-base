# Playwright Training Example

## Overview

This is a sample project for Playwright training, demonstrating how to use Playwright for end-to-end testing of the [PocketBase](https://pocketbase.io/demo/) web application.

## Features scope

- Login
  - Verify that the user can log in successfully
  - Verify that the user failed to log in with the wrong username
  - Verify that the user failed to log in with the empty inputs
- Search
  - Verify that the user can search users with a matching email
  - Verify that the user can search for users with the wrong text
  - Verify that the user can search users with half of the matching text
  - After searching value does not match any user. Verify user can see all users when clicking the clear button in the table
  - Verify that the user can see all users after clicking the button to clear
- New Record
  - Verify that the user can add a new user with just the required input
  - Verify that the user can add a new user by filling in all the inputs
  - Verify that the user can't upload an avatar after clicking the button Create
  - Verify that the user can't create a new user when typing a username of less than 3 characters
  - Verify that the user can't create a new user when typing the wrong username
  - Verify that the user can't create a new user when typing a wrong format email
  - Verify that the user can't create a new user when typing the wrong format ID
  - Verify that the user can leave the form while the form has values
  - Verify that the user can't create user with empty inputs
  - Verify that the user can't create a user when the email already exists
- Edit Record
  - Verify that the user can update the email of the item they selected
  - Verify that the user can update the email of the item they selected and stay in the modal to continue updating
  - Verify that user can't update email if the email already exist
- Delete Record
  - Verify that user can delete single item
  - Verify that user can delete multiple items
  - Verify that user can delete all items
  - Verify that user can unselect item delete in the table
  - Verify that user can unselect item delete with the button reset
  - Verify that the user can unselect all items in the header of the table
- Sort
  - Verify that the user can sort the ID column alphabetical order after clicking the column header.
  - Verify that the user can sort the email column alphabetical order after clicking the column header.
  - Verify that the user can sort the emailVisibility column alphabetical order after clicking the column header.
  - Verify that user can sort the username column in alphabetical order after clicking the column header.
  - Verify that user can sort the website column in alphabetical order after clicking the column header.

## Setup environment

1. Make sure you install packages with correct version below:

- node v20.18.0
- npm 10.8.2

2. Redirect to folder

```
cd PocketBase
```

3. Install Dependencies

```
npm install
```

4. Create a `.env` file in the root directory of the project and add the following environment variables:

```
USER_NAME=test@example.com
PASSWORD=123456
INVALID_USER_NAME=test123@example.com
INVALID_PASSWORD=1234567
BASE_URL=https://pocketbase.io
```

## Ways to use

1. Run all Tests

```
npx playwright test
```

2. Run Tests by file

```
npx playwright test login.spec.ts
```

3. Run Tests with UI mode

```
npx playwright test --ui
```

4. Debug Tests

```
npx playwright test --debug
```

5. View HTML Report

```
npx playwright show-report
```
