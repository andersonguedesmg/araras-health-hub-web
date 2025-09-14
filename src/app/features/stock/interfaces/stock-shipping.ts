import { Account } from "../../account/interfaces/account";
import { Employee } from "../../employee/interfaces/employee";
import { StockShippingItem } from "./stock-shipping-item";

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
