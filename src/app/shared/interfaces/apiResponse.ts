export interface ApiResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: T;
  statusCode: number;
  message: string;
  success: boolean;
  errors: string[] | null;
}
