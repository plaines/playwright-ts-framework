import { expect } from '@playwright/test';
import { LABELS, ROUTES } from '../../configs/constants';
import { TopBarElements } from '../elements/TopBarElements';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  protected readonly path = ROUTES.dashboard;
  readonly topBar = new TopBarElements(this.page);

  /** Override: the dashboard is ready only when its header is rendered. */
  override async waitForLoaded(): Promise<void> {
    await super.waitForLoaded();
    await expect(this.topBar.pageTitle).toHaveText(LABELS.dashboard);
  }

  async logout(): Promise<void> {
    await this.topBar.userMenu.click();
    await this.topBar.logoutLink.click();
  }
}
