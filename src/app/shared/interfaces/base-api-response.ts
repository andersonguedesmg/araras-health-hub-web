export type ApiValidationErrors = Record<string, string[]>;

export interface BaseApiResponse<T> {
  data: T | null;
  statusCode: number;
  message: string;
  success: boolean;
  errors: ApiValidationErrors | null;
}
