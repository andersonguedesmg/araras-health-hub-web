export interface BaseApiResponse<T> {
  data: T | null;
  statusCode: number;
  message: string;
  success: boolean;
  errors: string[] | null;
}
