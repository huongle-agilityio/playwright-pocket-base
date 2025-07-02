import { expect } from '@playwright/test';

// Interfaces
import { User } from '@/interfaces';

export class UserTable {
  readonly page;

  constructor(page) {
    this.page = page.frameLocator('iframe');
  }

  async getRowByEmail(email: string) {
    return this.page.locator('tr', {
      has: this.page.locator('td', { hasText: email }),
    });
  }

  async verifyUserRow({
    email,
    name = 'N/A',
    avatar = 'N/A',
    website = 'N/A',
    isEmailVisibility = false,
    isVerified = false,
  }: User) {
    const row = await this.getRowByEmail(email);

    await expect(row.locator('td.col-field-email')).toContainText(email);
    await expect(row.locator('td.col-field-emailVisibility')).toHaveText(
      isEmailVisibility ? 'True' : 'False',
    );
    await expect(row.locator('td.col-field-verified')).toHaveText(isVerified ? 'True' : 'False');
    await expect(row.locator('td.col-field-name')).toHaveText(name);
    await expect(row.locator('td.col-field-avatar')).toHaveText(avatar);
    await expect(row.locator('td.col-field-website')).toHaveText(website);
  }
}
