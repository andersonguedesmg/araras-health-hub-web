import { BaseApiResponse } from "./base-api-response";

export interface ApiResponse<T> extends BaseApiResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
