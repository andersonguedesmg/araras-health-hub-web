interface ApiValidationErrors {
  [key: string]: string[];
}

export interface BaseApiResponse<T> {
  data: T | null;
  statusCode: number;
  message: string;
  success: boolean;
  errors: ApiValidationErrors | null;
}
