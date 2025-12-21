export interface DashboardSummary {
  pendingApprovalCount: number;
  pendingSeparationCount: number;
  pendingDeliveryCount: number;
  criticalStockCount: number;
  totalActiveProducts: number;
  monthlyEvolution: { month: string, count: number; }[];
  categoryDistribution: { category: string, value: number; }[];
}
