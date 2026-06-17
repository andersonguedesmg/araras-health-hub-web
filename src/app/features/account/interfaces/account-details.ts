import { Scope } from '../../../shared/enums/scope.enum';
import { Facility } from '../../facility/interfaces/facility';

export interface AccountDetails {
  id: number;
  userName: string;
  facilityId?: number;
  facility?: Facility;
  createdOn: string;
  updatedOn: string | null;
  role: number;
  scope: Scope;
  isActive: boolean;
}
