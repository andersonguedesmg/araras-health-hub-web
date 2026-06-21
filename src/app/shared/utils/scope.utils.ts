import { Scope } from '../enums/scope.enum';
import { Severity } from '../enums/severity.enum';

export function getScopeSeverity(scope: number): Severity {
  switch (scope) {
    case Scope.Management:
      return Severity.Warn;
    case Scope.Operational:
      return Severity.Danger;
    default:
      return Severity.Contrast;
  }
}

export function getScopeValue(scope: number): string {
  switch (scope) {
    case Scope.Management:
      return 'Gerencial';
    case Scope.Operational:
      return 'Operacional';
    default:
      return 'Unknown';
  }
}
