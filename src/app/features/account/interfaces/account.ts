import { Facility } from "../../facility/interfaces/facility";

export interface Account {
  userId: number;
  userName: string;
  facilityId: number;
  facility?: Facility;
  createdOn: string;
  updatedOn: string;
  isActive: boolean;
}
