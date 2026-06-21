import { Roles } from '../enums/roles.enum';

type TagSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

export function getRoleSeverity(role: number): TagSeverity {
  switch (role) {
    case Roles.Master:
      return 'secondary';
    case Roles.Admin:
      return 'warn';
    case Roles.User:
      return 'info';
    default:
      return 'contrast';
  }
}

export function getRoleValue(role: number): string {
  switch (role) {
    case Roles.Master:
      return 'Master';
    case Roles.Admin:
      return 'Administrador';
    case Roles.User:
      return 'Usuário';
    default:
      return 'Desconhecido';
  }
}
