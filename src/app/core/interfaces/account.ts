export interface Account {
  userName: string;
  userId: number;
  createdOn: string;
  updatedOn: string;
  roles: { id: number; name: string; }[];
  isActive: boolean;
  facilityId: number;
  scope: number;
  token: string;
}
