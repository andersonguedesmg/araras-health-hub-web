export interface Product {
  id: number;
  name: string;
  description: string;
  mainCategoryId: number;
  mainCategoryName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  packagingTypeId: number;
  packagingTypeName?: string;
  isActive: boolean;
  createdOn?: string;
  updatedOn?: string;
}
