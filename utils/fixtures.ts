// playwright-bdd's `test` is Playwright's `test` plus BDD hooks, so it serves both normal specs and steps.
import { test as base } from 'playwright-bdd';
import { AddEmployeePage } from '../pom/pages/AddEmployeePage';
import { AdminUsersPage } from '../pom/pages/AdminUsersPage';
import { DashboardPage } from '../pom/pages/DashboardPage';
import { LoginPage } from '../pom/pages/LoginPage';
import { FakeStoreClient } from './api/FakeStoreClient';

export type Pages = {
  login: LoginPage;
  dashboard: DashboardPage;
  adminUsers: AdminUsersPage;
  addEmployee: AddEmployeePage;
};

type Fixtures = {
  pages: Pages;
  fakeStore: FakeStoreClient;
};

/**
 * Custom test: injects the page-object collection and the API client.
 * Both are test-scoped, so they live and die with each test's `page` / `request`.
 */
export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    await use({
      login: new LoginPage(page),
      dashboard: new DashboardPage(page),
      adminUsers: new AdminUsersPage(page),
      addEmployee: new AddEmployeePage(page),
    });
  },
  fakeStore: async ({ request }, use) => {
    await use(new FakeStoreClient(request));
  },
});

export { expect } from './assertions';
