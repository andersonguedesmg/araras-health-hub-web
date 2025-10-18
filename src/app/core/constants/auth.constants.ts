export enum UserRoles {
  MASTER = 'Master',
  ADMIN = 'Admin',
  USER = 'User',
}

export enum UserScopes {
  UNASSIGNED = 'Unassigned',
  MANAGEMENT = 'Management',
  OPERATIONAL = 'Operational',
}

export const SCOPE_MAPPING: { [key: number]: UserScopes; } = {
  0: UserScopes.UNASSIGNED,
  1: UserScopes.MANAGEMENT,
  2: UserScopes.OPERATIONAL,
};
