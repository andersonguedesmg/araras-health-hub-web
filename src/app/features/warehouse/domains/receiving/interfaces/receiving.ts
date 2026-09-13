import { Account } from '../../../../../core/interfaces/auth.interfaces';
import { Product } from '../../../../admin/domains/product/interfaces/product';
import { Supplier } from '../../../../admin/domains/supplier/interfaces/supplier';

export interface Employee {
  id: number;
  name: string;
  cpf: string;
  email: string;
  isActive: boolean;
}

export interface ReceivingItemRequest {
  quantity: number;
  unitValue: number;
  batch: string;
  brand: string;
  expiryDate: string | Date;
  productId: number;
}

export interface CreateReceivingRequest {
  invoiceNumber: string;
  supplyAuthorization: string;
  observation?: string;
  receivingDate: string | Date;
  supplierId: number;
  responsibleId: number;
  accountId: number;
  receivedItems: ReceivingItemRequest[];
}
export interface ReceivingHeaderFormData {
  invoiceNumber: string;
  supplyAuthorization: string;
  totalValue: number;
  supplierId: number | null;
  responsibleId: number | null;
  receivingDate: Date;
  observation?: string;
}

export interface ReceivingItem {
  id: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
  batch: string;
  brand: string;
  expiryDate: Date | string;
  productId: number;
  product?: Product;
}

export interface Receiving {
  id: number;
  invoiceNumber: string;
  supplyAuthorization: string;
  observation?: string;
  receivingDate: Date | string;
  supplierId: number;
  supplier?: Supplier;
  responsibleId: number;
  responsible?: Employee;
  accountId: number;
  account?: Account;
  totalValue: number;
  receivedItems: ReceivingItem[];
}
