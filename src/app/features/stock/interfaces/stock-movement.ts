export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  responsibleName: string;
  createdOn: string;
  sourceDocumentId: number;
  sourceDocumentType: string;
  type: number;
}
