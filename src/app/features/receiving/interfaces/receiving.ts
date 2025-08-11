import { Account } from "../../account/interfaces/account";
import { Employee } from "../../employee/interfaces/employee";
import { Supplier } from "../../supplier/interfaces/supplier";
import { ReceivingItem } from "./receiving-item";

export interface Receiving {
  id: number;
  invoiceNumber: string;
  supplyAuthorization: string;
  observation: string;
  receivingDate: Date;
  supplierId: number;
  supplier: Supplier;
  responsibleId: number;
  responsible: Employee;
  accountId: number;
  totalValue: number;
  account: Account;
  receivedItems: ReceivingItem[];
}
