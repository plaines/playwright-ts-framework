import { LABELS, ROUTES } from '../../configs/constants';
import { AdminUsersElements } from '../elements/AdminUsersElements';
import { BasePage } from './BasePage';

export class AdminUsersPage extends BasePage {
  protected readonly path = ROUTES.adminUsers;
  readonly elements = new AdminUsersElements(this.page);

  async selectOption(dropdownLabel: string, option: string): Promise<void> {
    await this.elements.dropdown(dropdownLabel).click();
    await this.elements.dropdownOption(option).click();
  }

  /** Clicks Search and waits for the users API response instead of a fixed sleep. */
  async search(): Promise<void> {
    const response = this.page.waitForResponse((r) => r.url().includes('/api/v2/admin/users') && r.ok());
    await this.elements.searchButton.click();
    await response;
  }

  async searchUsers(role: string, status: string): Promise<void> {
    await this.selectOption(LABELS.userRole, role);
    await this.selectOption(LABELS.status, status);
    await this.search();
  }
}
