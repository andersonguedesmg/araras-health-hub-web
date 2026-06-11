export enum UserRoles {
  UNASSIGNED = 0,
  MASTER = 1,
  ADMIN = 2,
  USER = 3,
}

export enum UserScopes {
  UNASSIGNED = 0,
  MANAGEMENT = 1,
  OPERATIONAL = 2,
}

export const ROLE_LABEL_MAPPING: { [key: number]: string } = {
  0: 'Unassigned',
  1: 'Master',
  2: 'Admin',
  3: 'User',
};

export const SCOPE_LABEL_MAPPING: { [key: number]: string } = {
  0: 'Unassigned',
  1: 'Management',
  2: 'Operational',
};
