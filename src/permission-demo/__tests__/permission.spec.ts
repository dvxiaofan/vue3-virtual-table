import { describe, expect, it } from 'vitest'
import { hasAccess, hasAllPermissions, hasAnyRole } from '../permission'
import { buildRequestMeta } from '../request'
import type { UserSession } from '../types'

describe('permission', () => {
  it('hasAnyRole works', () => {
    expect(hasAnyRole(['admin'], undefined)).toBe(true)
    expect(hasAnyRole(['admin'], [])).toBe(true)
    expect(hasAnyRole(['admin'], ['admin'])).toBe(true)
    expect(hasAnyRole(['admin'], ['operator'])).toBe(false)
    expect(hasAnyRole(['admin', 'operator'], ['operator'])).toBe(true)
  })

  it('hasAllPermissions works', () => {
    expect(hasAllPermissions(['a'], undefined)).toBe(true)
    expect(hasAllPermissions(['a'], [])).toBe(true)
    expect(hasAllPermissions(['a', 'b'], ['a'])).toBe(true)
    expect(hasAllPermissions(['a'], ['a', 'b'])).toBe(false)
  })

  it('hasAccess checks role and permissions', () => {
    expect(hasAccess(['admin'], ['user:read'], { roles: ['admin'] })).toBe(true)
    expect(hasAccess(['admin'], ['user:read'], { roles: ['operator'] })).toBe(false)
    expect(hasAccess(['admin'], ['user:read'], { permissions: ['user:read'] })).toBe(true)
    expect(hasAccess(['admin'], ['user:read'], { permissions: ['user:write'] })).toBe(false)
    expect(
      hasAccess(['admin'], ['user:read'], { roles: ['admin'], permissions: ['user:read'] })
    ).toBe(true)
  })
})

describe('request meta', () => {
  it('injects tenant and data scope headers', () => {
    const session: UserSession = {
      userId: 'u1',
      username: 'admin',
      roles: ['admin'],
      permissions: ['user:read'],
      dataScope: 'all',
      tenantId: 't-001'
    }
    const meta = buildRequestMeta(session)
    expect(meta.headers['X-Tenant-Id']).toBe('t-001')
    expect(meta.headers['X-Data-Scope']).toBe('all')
    expect(meta.headers.Authorization).toContain('Bearer')
  })
})

