import { ENV } from '../../configs/env.config';
import userSearches from '../../test-data/ui/user-search.json';
import { expect, test } from '../../utils/fixtures';

const ROLE_COLUMN = 2;
const STATUS_COLUMN = 4;

test.describe('Admin > User Management', () => {
  // Shared initialization for every test in this file.
  test.beforeEach(async ({ pages }) => {
    await pages.login.open();
    await pages.login.login(ENV.credentials.username, ENV.credentials.password);
    await pages.dashboard.waitForLoaded();
    await pages.adminUsers.open();
  });

  // Shared cleanup. Page and context are closed by their fixtures anyway; this shows the `context` fixture.
  test.afterEach(async ({ context }) => {
    await context.clearCookies();
  });

  // Parameterized UI test: dropdowns driven by a JSON data set.
  for (const { role, status } of userSearches) {
    test(`filters users by role "${role}" and status "${status}"`, async ({ pages }) => {
      await pages.adminUsers.searchUsers(role, status);

      await expect(pages.adminUsers.elements.columnCells(ROLE_COLUMN)).toHaveOnlyText(role);
      await expect(pages.adminUsers.elements.columnCells(STATUS_COLUMN)).toHaveOnlyText(status);
    });
  }
});
