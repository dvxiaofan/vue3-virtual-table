import type { Role, RouteMetaAccess } from './types'

export function hasAnyRole(userRoles: Role[], required?: Role[]) {
  if (!required || required.length === 0) return true
  return required.some(r => userRoles.includes(r))
}

export function hasAllPermissions(userPermissions: string[], required?: string[]) {
  if (!required || required.length === 0) return true
  return required.every(p => userPermissions.includes(p))
}

export function hasAccess(
  userRoles: Role[],
  userPermissions: string[],
  access?: RouteMetaAccess
) {
  if (!access) return true
  return hasAnyRole(userRoles, access.roles) && hasAllPermissions(userPermissions, access.permissions)
}

