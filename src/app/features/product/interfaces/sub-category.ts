import { MainCategory } from './main-category';

export interface SubCategory {
  id: number;
  name: string;
  isActive: boolean;
  mainCategoryId: number;
  mainCategory?: MainCategory;
  createdAt?: string;
  updatedAt?: string;
}
