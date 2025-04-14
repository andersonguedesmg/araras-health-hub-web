import { Account } from "../../account/interfaces/account";
import { Supplier } from "../../supplier/interfaces/supplier";
import { User } from "../../user/interfaces/user";
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
  responsible: User;
  accountId: number;
  account: Account;
  receivedItems: ReceivingItem[];
}
