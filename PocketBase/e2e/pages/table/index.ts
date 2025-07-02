import { expect } from '@playwright/test';

// Interfaces
import { User, Table } from '@/interfaces';

export class TablePage {
  readonly page;

  constructor(page) {
    this.page = page.frameLocator('iframe');
  }

  /**
   * Retrieves a table row that has a cell with the specified value in the
   * column with the given name.
   *
   * @param {Object}
   *   - columnName: The name of the column to search for the value in.
   *   - value: The value to search for in the specified column.
   * @return {Promise<ElementHandle>} - A promise resolving to the table row
   *   element handle.
   */
  async getRowByValue({ columnName, value }: { columnName: keyof Table; value: string }) {
    const row = this.page.locator(`tbody tr:has(td.col-field-${columnName}:has-text("${value}"))`);
    await expect(row).toBeVisible({ timeout: 5000 });

    return row;
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
  async extractRowData({ columnName, value }: { columnName: keyof Table; value: string }) {
    const cells = (await this.getRowByValue({ columnName, value })).locator('td');
    const count = await cells.count();

    const result: Record<string, string>[] = [];

    for (let i = 0; i < count; i++) {
      const cell = cells.nth(i);
      const classAttr = await cell.getAttribute('class');
      const match = classAttr?.match(/col-field-([a-zA-Z0-9_]+)/);

      if (match) {
        const columnName = match[1];
        const value = (await cell.innerText()).trim();
        result.push({ [columnName]: value });
      }
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
  async getCellByValue({ columnName, value }: { columnName: keyof Table; value: string }) {
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
   */
  async getAllValueCellByColumnName(columnName: keyof Table) {
    const values: string[] = [];
    const cells = this.page.locator(`tbody td.col-field-${columnName}`);
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
  async getRowByIndex(index: number) {
    const row = this.page.locator(`tbody tr:nth-child(${index})`);
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
  }: User) {
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
