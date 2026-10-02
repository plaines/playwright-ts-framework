import { ROUTES } from '../../configs/constants';
import { AddEmployeeElements } from '../elements/AddEmployeeElements';
import { BasePage } from './BasePage';

export class AddEmployeePage extends BasePage {
  protected readonly path = ROUTES.addEmployee;
  readonly elements = new AddEmployeeElements(this.page);

  async enableLoginDetails(): Promise<void> {
    await this.elements.createLoginToggle.click();
  }

  async chooseStatus(status: string): Promise<void> {
    await this.elements.statusRadioLabel(status).click();
  }
}
