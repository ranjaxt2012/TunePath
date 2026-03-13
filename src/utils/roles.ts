export type UserRole = 'learner' | 'tutor' | 'contributor' | 'admin' | 'power_admin';

export function hasRole(roles: UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}

export function isTutor(roles: UserRole[]): boolean {
  return hasRole(roles, 'tutor') || hasRole(roles, 'admin') || hasRole(roles, 'power_admin');
}

export function isAdmin(roles: UserRole[]): boolean {
  return hasRole(roles, 'admin') || hasRole(roles, 'power_admin');
}

export function isPowerAdmin(roles: UserRole[]): boolean {
  return hasRole(roles, 'power_admin');
}

export function canEditContent(roles: UserRole[]): boolean {
  return isTutor(roles) || hasRole(roles, 'contributor');
}
