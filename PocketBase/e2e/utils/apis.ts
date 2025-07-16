import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as OTPAuth from 'otpauth';
const authFilePath = path.resolve(__dirname, '../.auth/user.json');

// Constants
import { API_URLS } from '@/constants';

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
 * Waits for the response of a GET request to the given URL.
 *
 * @param {string} url - The URL to wait for
 * @param {Page} page - The Playwright Page object used to interact with the browser
 * @returns {Promise<Response>} A promise that resolves to the response object
 */
export const waitForGetResponse = ({ url, page }: { url: string; page: Page }) =>
  page.waitForResponse((res) => {
    const decodedURL = decodeURIComponent(res.url());

    return (
      decodedURL.includes(url) &&
      !decodedURL.includes('fields=id') &&
      res.request().method() === 'GET'
    );
  });

/**
 * Waits for the response of a POST request to the user API endpoint.
 *
 * @param {Page} page - The Playwright Page object used to interact with the browser.
 * @returns {Promise<Response>} A promise that resolves to the response object.
 */
export const waitForPostResponse = ({ url, page }: { url: string; page: Page }) =>
  page.waitForResponse((res) => res.url().includes(url) && res.request().method() === 'POST');

/**
 * Waits for the response of a PATCH request to the user API endpoint.
 *
 * @param {Page} page - The Playwright Page object used to interact with the browser.
 * @param {string} id - The ID of the user to patch.
 * @returns {Promise<Response>} A promise that resolves to the response object.
 */
export const waitForPatchResponse = ({ page, id }: { page: Page; id: string }) =>
  page.waitForResponse(
    (res) => res.url().includes(`${API_URLS.USER}/${id}`) && res.request().method() === 'PATCH',
  );

/**
 * Waits for the response of a DELETE request to the user API endpoint.
 *
 * @param {Page} page - The Playwright Page object used to interact with the browser.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<Response>} A promise that resolves to the response object.
 */
export const waitForDeleteResponse = ({ page, id }: { page: Page; id: string }) =>
  page.waitForResponse(
    (res) => res.url().includes(`${API_URLS.USER}/${id}`) && res.request().method() === 'DELETE',
  );

/**
 * Waits for the response of DELETE requests to the user API endpoint for multiple users.
 *
 * @param {Page} page - The Playwright Page object used to interact with the browser.
 * @returns {Promise<Response>} A promise that resolves when all DELETE requests have received a 204 status response.
 */
export const waitForDeleteMultipleResponse = ({ page }: { page: Page }) =>
  page.waitForResponse(
    (res) =>
      res.url().match(new RegExp(`^${API_URLS.USER}/[\\w-]+$`)) &&
      res.request().method() === 'DELETE' &&
      res.status() === 204,
  );

/**
 * Generates a Time-Based One-Time Password (TOTP) given a secret.
 *
 * @param {string} secret - The secret to use for generating the TOTP.
 * @returns {string} The generated TOTP.
 */
export const generateOTP = (secret: string): string => {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    digits: 6,
    algorithm: 'SHA1',
    period: 30,
  });

  return totp.generate();
};
