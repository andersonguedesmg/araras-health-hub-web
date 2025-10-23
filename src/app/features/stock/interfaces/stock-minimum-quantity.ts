export interface StockMinQuantity {
  id: number;
  productId: number;
  minQuantity: number;
  productName: string;
  productMainCategory: string;
  productPresentationForm: string;
  productSubCategory: string;
  productCode: string;
  productIsActive: boolean;
  currentQuantity: number;
}
