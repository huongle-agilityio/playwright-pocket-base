import { test as base, expect } from './pageFixtures';
import * as path from 'path';

export const test = base.extend<{ skipSetup: void }>({
  storageState: async ({ $tags }, use) => {
    const user_auth_storage_state = path.join(__dirname, '../.auth/user.json');

    if ($tags.includes('@skipSetup')) {
      await use({ cookies: [], origins: [] });
    } else {
      await use(user_auth_storage_state);
    }
  },
});

export { expect };
