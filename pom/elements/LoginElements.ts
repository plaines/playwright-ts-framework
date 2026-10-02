import { Locator, Page } from '@playwright/test';

/** Locators only, no behavior. CSS attribute selectors are stable on OrangeHRM's login form. */
export class LoginElements {
  constructor(private readonly page: Page) {}

  get usernameInput(): Locator {
    return this.page.locator('input[name="username"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }

  get submitButton(): Locator {
    return this.page.locator('form button[type="submit"]');
  }

  get errorAlert(): Locator {
    return this.page.locator('.oxd-alert-content-text');
  }
}
