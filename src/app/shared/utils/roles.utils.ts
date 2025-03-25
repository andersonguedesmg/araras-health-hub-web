import { Roles } from "../enums/roles.enum";
import { Severity } from "../enums/severity.enum";

export function getRoleSeverity(role: string): Severity {
  switch (role) {
    case 'Master':
      return Severity.Secondary;
    case 'Admin':
      return Severity.Warn;
    case 'User':
      return Severity.Info;
    default:
      return Severity.Contrast;
  }
}

export function getRoleValue(role: string): Roles {
  switch (role) {
    case 'Master':
      return Roles.Master;
    case 'Admin':
      return Roles.Admin;
    case 'User':
      return Roles.User;
    default:
      return Roles.Unknown;
  }
}
