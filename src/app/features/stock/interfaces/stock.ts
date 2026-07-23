import { Product } from '../../admin/domains/product/interfaces/product';

export interface Stock {
  id: number;
  productId: number;
  product: Product;
  CurrentQuantity: number;
  MinQuantity: number;
  ReservedQuantity: number;
  AvailableQuantity: number;
  AverageCost: number;
  IsCritical: boolean;
}
