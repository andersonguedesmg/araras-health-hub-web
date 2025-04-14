import { Account } from "../../account/interfaces/account";
import { Employee } from "../../employee/interfaces/employee";
import { Supplier } from "../../supplier/interfaces/supplier";
import { ReceivingItem } from "./receivingItem";

export interface Receiving {
  id: number;
  invoiceNumber: string;
  supplyAuthorization: string;
  observations: string;
  receivingDate: Date;
  supplierId: number;
  supplier: Supplier;
  responsibleId: number;
  responsible: Employee;
  accountId: number;
  account: Account;
  receivedItems: ReceivingItem[];
}
