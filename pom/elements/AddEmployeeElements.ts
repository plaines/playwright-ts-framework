import { Locator, Page } from '@playwright/test';

export class AddEmployeeElements {
  constructor(private readonly page: Page) {}

  /** Visible toggle the user clicks; the real <input type="checkbox"> is visually hidden. */
  get createLoginToggle(): Locator {
    return this.page.locator('.oxd-switch-wrapper label');
  }

  get createLoginCheckbox(): Locator {
    return this.page.locator('.oxd-switch-wrapper input[type="checkbox"]');
  }

  /** Label of the status radio button ("Enabled" / "Disabled"). */
  statusRadioLabel(status: string): Locator {
    return this.page.locator('.oxd-radio-wrapper label').filter({ hasText: status });
  }

  statusRadio(status: string): Locator {
    return this.statusRadioLabel(status).locator('input[type="radio"]');
  }
}
