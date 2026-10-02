import { Locator, Page } from '@playwright/test';

export class AdminUsersElements {
  constructor(private readonly page: Page) {}

  /**
   * Chained + filtered locator. OrangeHRM's custom dropdowns have no id/name, so we find the
   * form group whose <label> has the given text, then the select inside that group.
   * This keeps us on CSS. The XPath alternative would be
   *   //label[text()='User Role']/ancestor::div[contains(@class,'oxd-input-group')]//div[contains(@class,'oxd-select-text')]
   * which is longer and more brittle, so XPath is not needed here.
   */
  dropdown(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: label }) })
      .locator('.oxd-select-text');
  }

  dropdownOption(option: string): Locator {
    return this.page.locator('.oxd-select-dropdown [role="option"]').filter({ hasText: new RegExp(`^${option}$`) });
  }

  get searchButton(): Locator {
    return this.page.locator('.oxd-form-actions button[type="submit"]');
  }

  /** Cells of one column in the results table (0 = checkbox, 1 = Username, 2 = User Role, 4 = Status). */
  columnCells(index: number): Locator {
    return this.page.locator('.oxd-table-body .oxd-table-row').locator(`.oxd-table-cell:nth-child(${index + 1})`);
  }
}
