import { expect } from '@playwright/test';

export class SearchInput {
  readonly page;
  readonly input;
  readonly searchButton;
  readonly clearButton;

  constructor(page) {
    this.page = page.frameLocator('iframe').locator('form.searchbar');
    this.input = this.page.getByRole('textbox');
    this.searchButton = this.page.getByRole('button', { name: 'Search' });
    this.clearButton = this.page.getByRole('button', { name: 'Clear' });
  }

  /**
   * Verifies that the search input field has the specified value.
   *
   * @param value - The value to verify the search input field has.
   */
  async verifySearchInputValue(value: string) {
    await expect(this.input).toHaveText(value);
  }

  async clickSearchButton() {
    await this.searchButton.click();
  }

  async clickClearButton() {
    await this.clearButton.click();
  }

  /**
   * Performs a search using the provided value.
   *
   * @param value - The search term or filter to input.
   */
  async search(value: string) {
    await this.input.click();
    await this.input.fill(value);
    await this.clickSearchButton();
  }
}
