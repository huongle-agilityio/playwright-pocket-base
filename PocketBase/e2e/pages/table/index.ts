import { expect, Locator, Page } from '@playwright/test';

// Constants
import { VALID_COLUMNS } from '@/constants';

// Interfaces
import { User, Table } from '@/interfaces';

export class TablePage {
  readonly page;

  constructor(page: Page) {
    this.page = page;
  }

  private get frame() {
    return this.page.frameLocator('iframe');
  }

  /**
   * Verifies that a message with the specified text is visible on the page.
   *
   * @param message - The text of the message to verify.
   */
  async verifyMessage(message: string) {
    await expect(this.frame.getByRole('heading', { name: message })).toBeVisible({
      timeout: 6000,
    });
  }

  buttonClearFilters(): Locator {
    return this.frame.getByRole('button', { name: 'Clear filters' });
  }

  getLength(): Promise<number> {
    return this.frame.locator('tbody tr:has(td:not(:has(h6)))').count();
  }

  async waitForTableToLoad() {
    await expect(this.frame.locator('table.table-loading')).toHaveCount(0, {
      timeout: 5000,
    });
  }

  /**
   * Retrieves a table row with the specified value in the given column.
   *
   * @param columnName - The name of the column to search for the value in.
   * @param value - The value to search for in the specified column.
   * @param {boolean} requireVisible - Whether to wait for the row to be visible before returning
   *   it. Defaults to true.
   * @return {Promise<Locator>} - A promise resolving to the table row element handle.
   */
  async getRowByValue({
    columnName,
    value,
    requireVisible = true,
  }: {
    columnName: keyof Table;
    value: string;
    requireVisible?: boolean;
  }): Promise<Locator> {
    await this.waitForTableToLoad();
    const row = this.frame.locator(`tbody tr:has(td.col-field-${columnName}:has-text("${value}"))`);

    if (requireVisible) {
      await expect(row).toBeVisible({ timeout: 5000 });
    }

    return row;
  }

  /**
   * Returns a column header element based on the column name.
   *
   * @param columnName - The name of the column (should match the "title" attribute in <th>).
   * @returns {Locator} - The Playwright Locator for the column header.
   */
  getColumn(columnName: keyof Table): Locator {
    return this.frame.locator(`thead tr th[title="${columnName}"]`);
  }

  /**
   * Selects a table row by clicking the bulk select checkbox in the row that
   * matches the specified value in the given column.
   *
   * @param columnName - The name of the column to search for the value in.
   * @param value - The value to search for in the specified column.
   * @return {Promise<Locator>} - A promise resolving to the checkbox element
   *   handle.
   */
  async selectRowByValue({
    columnName,
    value,
  }: {
    columnName: keyof Table;
    value: string;
  }): Promise<Locator> {
    await this.waitForTableToLoad();
    const row = await this.getRowByValue({ columnName, value });
    const checkbox = row.locator('td.bulk-select-col input[type="checkbox"]');

    const checkboxId = await checkbox.getAttribute('id');
    const label = row.locator(`label[for="${checkboxId}"]`);

    await expect(label).toBeVisible();
    await label.click();

    return checkbox;
  }

  /**
   * Selects multiple table rows by clicking the bulk select checkboxes.
   *
   * @param {Object}
   *   - columnName: The name of the column to search for the values in.
   *   - targetNames: An array of values to search for in the specified column.
   */
  async selectMultipleRowsByValue({
    columnName,
    targetNames,
  }: {
    columnName: keyof Table;
    targetNames: string[];
  }): Promise<Locator[]> {
    await this.waitForTableToLoad();
    const listCheckbox = [];
    for (const name of targetNames) {
      const row = await this.getRowByValue({ columnName, value: name });

      const checkbox = row.locator('td.bulk-select-col input[type="checkbox"]');
      listCheckbox.push(checkbox);
      const checkboxId = await checkbox.getAttribute('id');

      const label = row.locator(`label[for="${checkboxId}"]`);
      await expect(label).toBeVisible();
      await label.click();
    }

    return listCheckbox;
  }

  /**
   * Selects all rows in the table by clicking the bulk select checkbox in the header.
   * Ensures the checkbox is visible before interacting with it.
   */
  async selectAllRows() {
    await this.waitForTableToLoad();
    const checkbox = await this.frame.locator(`thead th.bulk-select-col label`);
    await expect(checkbox).toBeVisible();
    await checkbox.click();
  }

  /**
   * Retrieves all table rows present in the table.
   *
   * @return {Locator} - A Locator object representing all the rows in the table body.
   */
  getAllRows(): Locator {
    return this.frame.locator('tbody tr');
  }

  /**
   * Retrieves all checkbox elements present in the table.
   *
   * @return {Locator} - A Locator object representing the checkbox elements.
   */
  getAllCheckbox(): Locator {
    return this.getAllRows().locator('td.bulk-select-col input[type="checkbox"]');
  }

  /**
   * Retrieves all table rows that have a cell with the specified value
   * in the column with the given name.
   *
   * @param {Object}
   *   - columnName: The name of the column to search for the value in.
   *   - value: The value to search for in the specified column.
   * @return {Promise<Locator>} - A locator representing all matched rows.
   */
  async getMultipleRowsByValue({
    columnName,
    value,
  }: {
    columnName: keyof Table;
    value: string;
  }): Promise<Locator> {
    await this.waitForTableToLoad();
    return await this.frame.locator(
      `tbody tr:has(td.col-field-${columnName}:has-text("${value}"))`,
    );
  }

  /**
   * Extracts and returns data from a row in the table that matches a specified
   * column name and value.
   *
   * @param columnName - The name of the column to search for the value in.
   * @param value - The value to search for in the specified column.
   * @return {Promise<Record<string, string>[]>} - A promise that resolves to an
   *   array of objects, each containing a column name and its corresponding cell
   *   value in the row.
   *
   * Example:
   * [
   *   { "name": "John Doe" },
   *   { "email": "lorem@gmail.com" },
   * ]
   */
  async extractRowData({
    columnName,
    value,
    validColumns = VALID_COLUMNS,
  }: {
    columnName: keyof Table;
    value: string;
    validColumns?: (keyof Table)[];
  }): Promise<Record<string, string>[]> {
    const cells = (await this.getRowByValue({ columnName, value })).locator('td');
    const count = await cells.count();

    const result: Record<string, string>[] = [];

    for (let i = 0; i < count; i++) {
      const cell = cells.nth(i);
      const classAttr = await cell.getAttribute('class');
      const match = classAttr?.match(/col-field-([a-zA-Z0-9_]+)/);

      if (!match) continue;

      const key = match[1] as keyof Table;
      if (!validColumns.includes(key)) continue;

      const text = (await cell.innerText()).trim();
      result.push({ [key]: text });
    }

    return result;
  }

  /**
   * Retrieves a table cell with the specified value in the given column.
   *
   * @param columnName - The name of the column to search for the value in.
   * @param value - The value to search for in the specified column.
   * @return {Promise<ElementHandle>} - A promise resolving to the table cell element handle.
   */
  async getCellByValue({
    columnName,
    value,
  }: {
    columnName: keyof Table;
    value: string;
  }): Promise<Locator> {
    await this.waitForTableToLoad();
    const row = await this.getRowByValue({ columnName, value });
    const cell = row.locator(`td.col-field-${columnName}`);
    await expect(cell).toBeVisible({ timeout: 3000 });

    return cell;
  }

  /**
   * Retrieves all cell values from a specified column in the table.
   *
   * @param columnName - The name of the column to retrieve cell values from.
   * @return {Promise<string[]>} - A promise that resolves to an array of strings,
   *   each representing a cell value from the specified column.
   *
   * Example: ["lorem123@gmail.com", "lorem@gmail.com"]
   */
  async getAllValueCellByColumnName(columnName: keyof Table): Promise<string[]> {
    const values: string[] = [];
    const cells = this.frame.locator(`tbody td.col-field-${columnName}`);
    const count = await cells.count();

    for (let i = 0; i < count; i++) {
      const cell = cells.nth(i);
      const text = (await cell.innerText()).trim();
      values.push(text);
    }

    return values;
  }

  /**
   * Retrieves a table row at the specified index.
   *
   * @param index - The index of the row to retrieve.
   * @return {Promise<ElementHandle>} - A promise that resolves to the table row element handle.
   */
  async getRowByIndex(index: number): Promise<Locator> {
    const row = this.frame.locator(`tbody tr:nth-child(${index})`);
    await expect(row).toBeVisible({ timeout: 5000 });

    return row;
  }

  async verifyUserRow({
    email,
    name = 'N/A',
    avatar = 'N/A',
    website = 'N/A',
    isEmailVisibility = false,
    isVerified = false,
  }: User): Promise<void> {
    const row = await this.getRowByValue({ columnName: 'email', value: email });

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
