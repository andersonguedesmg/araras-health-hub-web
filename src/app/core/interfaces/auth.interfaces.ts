import { UserRoles, UserScopes } from '../constants/auth.constants';

export interface LoginRequest {
  userName: string;
  password?: string;
}

export interface Account {
  id: number;
  userName: string;
  isActive: boolean;
  facilityId: number;
  scope: UserScopes;
  role: UserRoles;
  token: string;
}

export interface AccountInfo {
  userName: string;
  scope: string;
  role: string;
  facilityId: string;
  userId: string;
}
