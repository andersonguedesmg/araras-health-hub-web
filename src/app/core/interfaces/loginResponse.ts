import { Account } from "./account";

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: Account | null;
}
