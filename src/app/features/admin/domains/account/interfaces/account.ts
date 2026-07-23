import { Roles } from '../../../../../shared/enums/roles.enum';
import { Scope } from '../../../../../shared/enums/scope.enum';
import { Facility } from '../../../../facility/interfaces/facility';

export interface Account {
  id: number;
  userId: number;
  userName: string;
  isActive: boolean;
  scope: Scope;
  role: Roles;
  createdOn: string;
  updatedOn: string | null;
  facility: Facility;
}
