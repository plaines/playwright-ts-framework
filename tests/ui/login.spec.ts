import { ENV } from '../../configs/env.config';
import { LABELS, ROUTES } from '../../configs/constants';
import { LoginPage } from '../../pom/pages/LoginPage';
import invalidLogins from '../../test-data/ui/invalid-logins.json';
import { expect, test } from '../../utils/fixtures';

test.describe('Login', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.login.open();
  });

  test('valid user lands on the dashboard', async ({ pages }) => {
    await pages.login.login(ENV.credentials.username, ENV.credentials.password);

    await pages.dashboard.waitForLoaded();
    await expect(pages.dashboard.topBar.pageTitle).toHaveText(LABELS.dashboard);
  });

  // Parameterized UI test driven by a JSON data set.
  for (const { case: name, username, password } of invalidLogins) {
    test(`shows an error for ${name}`, async ({ pages }) => {
      await pages.login.login(username, password);

      await expect(pages.login.elements.errorAlert).toHaveText(LABELS.invalidCredentials);
    });
  }

  test('a new browser context does not share the session', async ({ pages, browser }) => {
    await pages.login.login(ENV.credentials.username, ENV.credentials.password);
    await pages.dashboard.waitForLoaded();

    // A context created by hand is NOT managed by a fixture (and does not inherit baseURL),
    // so we must close it ourselves.
    const isolatedContext = await browser.newContext({ baseURL: ENV.baseUrl });
    try {
      const isolatedPage = await isolatedContext.newPage();
      await isolatedPage.goto(ROUTES.dashboard);
      // Redirected to login: the new context has no session cookie.
      await new LoginPage(isolatedPage).waitForLoaded();
    } finally {
      // Runs whether the assertions pass or fail; a failure above still fails the test.
      await isolatedContext.close();
    }
  });
});
