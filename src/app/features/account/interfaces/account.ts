import { Scope } from "../../../shared/enums/scope.enum";
import { Facility } from "../../facility/interfaces/facility";

export interface Account {
  userId: number;
  userName: string;
  facilityId: number;
  facility?: Facility;
  createdOn: string;
  updatedOn: string;
  roles: string[];
  scope: Scope;
  isActive: boolean;
}
