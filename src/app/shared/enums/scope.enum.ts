import { SelectOptions } from "../interfaces/select-options";

export enum Scope {
  Management = 1,
  Operational = 2,
}

export const ScopeOptions: SelectOptions<Scope>[] = [
  { label: 'Gerencial', value: Scope.Management },
  { label: 'Operacional', value: Scope.Operational },
];
