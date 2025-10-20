import { Roles } from "../enums/roles.enum";
import { Scope } from "../enums/scope.enum";
import { Severity } from "../enums/severity.enum";

export function getScopeSeverity(scope: number): Severity {
  switch (scope) {
    case 1:
      return Severity.Warn;
    case 2:
      return Severity.Danger;
    default:
      return Severity.Contrast;
  }
}

export function getScopeValue(scope: number): string {
  switch (scope) {
    case 1:
      return 'Gerencial';
    case 2:
      return 'Operacional';
    default:
      return 'Unknown';
  }
}
