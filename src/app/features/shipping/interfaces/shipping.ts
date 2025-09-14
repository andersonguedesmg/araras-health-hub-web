import { Account } from "../../account/interfaces/account";
import { Employee } from "../../employee/interfaces/employee";
import { Supplier } from "../../supplier/interfaces/supplier";
import { shippingItem } from "./shipping-item";

export interface Shipping {
  id: number;
  invoiceNumber: string;
  supplyAuthorization: string;
  observation: string;
  shippingDate: Date;
  supplierId: number;
  supplier: Supplier;
  responsibleId: number;
  responsible: Employee;
  accountId: number;
  totalValue: number;
  account: Account;
  shippedItems: shippingItem[];
}
