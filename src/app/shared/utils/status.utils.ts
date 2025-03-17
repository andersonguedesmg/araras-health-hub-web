import { Severity } from "../enums/severity.enum";
import { Status } from "../enums/status.enum";

export function getSeverity(status: boolean): Severity {
  switch (status) {
    case true:
      return Severity.Success;
    case false:
      return Severity.Danger;
    default:
      return Severity.Warn;
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
