import { Account } from '../../admin/domains/account/interfaces/account';
import { Employee } from '../../admin/domains/employee/interfaces/employee';
import { StockShippingItem } from './stock-shipping-item';

export interface StockShipping {
  id: number;
  invoiceNumber: string;
  supplyAuthorization: string;
  observation: string;
  shippingDate: Date;
  responsibleId: number;
  responsible: Employee;
  accountId: number;
  totalValue: number;
  account: Account;
  shippedItems: StockShippingItem[];
}
