import { ENV } from '../../configs/env.config';
import { STATUS_OPTIONS } from '../../configs/constants';
import { expect, test } from '../../utils/fixtures';

// Exercises a checkbox (toggle) and radio buttons. The form is never saved,
// so no data is created on the shared demo server.
test.describe('PIM > Add Employee form controls', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.login.open();
    await pages.login.login(ENV.credentials.username, ENV.credentials.password);
    await pages.dashboard.waitForLoaded();
    await pages.addEmployee.open();
  });

  test('enables login details and selects a status radio', async ({ pages }) => {
    const { elements } = pages.addEmployee;
    await expect(elements.createLoginCheckbox).not.toBeChecked();

    await pages.addEmployee.enableLoginDetails();
    await expect(elements.createLoginCheckbox).toBeChecked();

    await pages.addEmployee.chooseStatus(STATUS_OPTIONS.disabled);
    await expect(elements.statusRadio(STATUS_OPTIONS.disabled)).toBeChecked();
    await expect(elements.statusRadio(STATUS_OPTIONS.enabled)).not.toBeChecked();
  });
});
