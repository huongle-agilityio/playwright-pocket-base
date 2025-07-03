import { request } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
const authFilePath = path.resolve(__dirname, '../../playwright/.auth/user.json');

// Constants
import { BASE_URL } from '@/constants';

/**
 * Extracts the access token from the auth file stored at the path specified by
 * the `authFilePath` constant. The token is extracted from the `__pb_superuser_auth__`
 * local storage item of the origin specified by the `BASE_URL` environment variable.
 * If the token is not found, an empty string is returned.
 *
 * @returns {string} The access token or an empty string if the token is not found.
 */
export const extractAccessToken = () => {
  try {
    if (!fs.existsSync(authFilePath)) {
      return;
    }

    const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));

    const origin = authData.origins.find(
      (o: { origin: string }) => o.origin === process.env.BASE_URL,
    );
    const authItem = origin?.localStorage.find(
      (item: { name: string; value: string }) => item.name === '__pb_superuser_auth__',
    );

    if (authItem?.value) {
      const parsed = JSON.parse(authItem.value);
      return parsed.token || '';
    }
  } catch (err) {
    console.warn('Could not extract token', err);
  }

  return '';
};

/**
 * Creates a new API context with the base URL set to the environment variable
 * `BASE_URL` and the authorization header set to the environment variable
 * `ADMIN_TOKEN`. The created context is then returned.
 */
export const createApiContext = async () => {
  const token = extractAccessToken();

  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};
