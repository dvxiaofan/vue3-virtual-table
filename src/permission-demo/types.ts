export type Role = 'admin' | 'operator' | 'auditor'

export type DataScope = 'self' | 'dept' | 'all'

export interface Tenant {
  id: string
  name: string
}

export interface LoginPayload {
  username: string
  password: string
  tenantId: string
}

export interface LoginResult {
  token: string
  tenantId: string
}

export interface UserSession {
  userId: string
  username: string
  roles: Role[]
  permissions: string[]
  dataScope: DataScope
  tenantId: string
}

export interface RouteMetaAccess {
  roles?: Role[]
  permissions?: string[]
}

