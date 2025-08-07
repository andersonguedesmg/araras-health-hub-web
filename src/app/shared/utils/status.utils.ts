import { Severity } from "../enums/severity.enum";
import { Status } from "../enums/status.enum";

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export function getSeverity(status: boolean): TagSeverity {
  switch (status) {
    case true:
      return Severity.Success as TagSeverity;
    case false:
      return Severity.Danger as TagSeverity;
    default:
      return Severity.Warn as TagSeverity;
  }
}

export function getStatus(status: boolean): Status {
  switch (status) {
    case true:
      return Status.Active;
    case false:
      return Status.Inactive;
    default:
      return Status.Unknown;
  }
}
