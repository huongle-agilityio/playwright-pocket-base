import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

// Fixtures
import { test as base } from './baseFixture';

// Components
import { UserForm, TablePage, SearchInput } from '../components';

// Interfaces
import { User } from '@/interfaces';

// Utils
import { createUserMockFixture } from '@/utils';

interface PagesFixture {
  userForm: UserForm;
  tablePage: TablePage;
  searchInput: SearchInput;
}

interface PrepareAndCleanup {
  deleteUserMocking: User[];
  editUserMocking: User[];
  searchUserMocking: User[];
  sortUserMocking: User[];
}

const basePage = base.extend<PagesFixture>({
  tablePage: async ({ page }, use) => {
    const tablePage = new TablePage(page);
    await use(tablePage);
  },

  userForm: async ({ page }, use) => {
    const form = new UserForm(page);
    await use(form);
  },

  searchInput: async ({ page }, use) => {
    const searchInput = new SearchInput(page);
    await use(searchInput);
  },
});

const test = basePage.extend<PrepareAndCleanup>({
  deleteUserMocking: createUserMockFixture(['delete1', 'delete2', 'delete3']),
  editUserMocking: createUserMockFixture(['edit1', 'edit2', 'edit3']),
  searchUserMocking: createUserMockFixture(['search1', 'search2', 'search3']),
  sortUserMocking: createUserMockFixture(['sort1', 'sort2', 'sort3']),
});

export { test, expect };
export const { Given, When, Then, AfterScenario } = createBdd(test);
