export interface Receiving {
  id: number;
  supplierId: number;
  supplier: any;
  receivingDate: Date;
  invoiceNumber: string;
  responsible: any;
  responsibleId: number;
  accountId: number;
  account: any;
  observations: string;
  receivedItems: any[];
}
