import { Account } from '../../../../../core/interfaces/auth.interfaces';
import { Employee } from '../../../../admin/domains/employee/interfaces/employee';
import { Supplier } from '../../../../admin/domains/supplier/interfaces/supplier';
import { ReceivingItem } from './receiving-item';

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
  receivedItem: ReceivingItem[];
}
