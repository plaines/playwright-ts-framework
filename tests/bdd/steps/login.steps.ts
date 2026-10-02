import { createBdd } from 'playwright-bdd';
import { ENV } from '../../../configs/env.config';
import { expect, test } from '../../../utils/fixtures';

// Steps reuse the same custom fixture (`pages`) as the regular Playwright tests.
const { Given, When, Then } = createBdd(test);

Given('I am on the OrangeHRM login page', async ({ pages }) => {
  await pages.login.open();
});

When('I log in with valid credentials', async ({ pages }) => {
  await pages.login.login(ENV.credentials.username, ENV.credentials.password);
});

When('I log in as {string} with password {string}', async ({ pages }, username: string, password: string) => {
  await pages.login.login(username, password);
});

Then('I should see the {string} page title', async ({ pages }, title: string) => {
  await expect(pages.dashboard.topBar.pageTitle).toHaveText(title);
});

Then('I should see the error message {string}', async ({ pages }, message: string) => {
  await expect(pages.login.elements.errorAlert).toHaveText(message);
});
