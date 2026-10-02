import { expect, Page } from '@playwright/test';

/**
 * Abstract parent: describes what every page can do (open itself, know when it is ready).
 * Concrete pages provide their `path` and override `waitForLoaded` when the URL is not enough.
 */
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoaded();
  }

  /** Default readiness check. Child classes override it (runtime polymorphism). */
  async waitForLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }
}
