import { StockAdjustmentItem } from "./stock-adjustment-item";

export interface StockAdjustment {
  id: number;
  type: string;
  adjustmentDate: string;
  reason: string;
  observation: string;
  responsibleId: number;
  accountId: number;
  adjustmentItems: StockAdjustmentItem[];
}
