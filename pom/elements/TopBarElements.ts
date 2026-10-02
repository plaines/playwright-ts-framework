import { Locator, Page } from '@playwright/test';

/** Header shared by every authenticated page. */
export class TopBarElements {
  constructor(private readonly page: Page) {}

  get pageTitle(): Locator {
    return this.page.locator('.oxd-topbar-header-breadcrumb h6').first();
  }

  get userMenu(): Locator {
    return this.page.locator('.oxd-userdropdown-tab');
  }

  /** Chained locator: scope to the open dropdown menu, then find the logout link inside it. */
  get logoutLink(): Locator {
    return this.page.locator('.oxd-userdropdown-menu').locator('a[href*="logout"]');
  }
}
