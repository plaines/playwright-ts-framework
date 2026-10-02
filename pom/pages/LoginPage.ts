import { expect } from '@playwright/test';
import { ROUTES } from '../../configs/constants';
import { LoginElements } from '../elements/LoginElements';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = ROUTES.login;
  readonly elements = new LoginElements(this.page);

  async login(username: string, password: string): Promise<void> {
    await this.elements.usernameInput.fill(username);
    await this.elements.passwordInput.fill(password);
    await this.elements.submitButton.click();
  }

  /** Override: the URL appears before the Vue form renders, so also wait for the form. */
  override async waitForLoaded(): Promise<void> {
    await super.waitForLoaded();
    await expect(this.elements.submitButton).toBeVisible();
  }
}
