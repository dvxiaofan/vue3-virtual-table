import type { DataScope, LoginPayload, LoginResult, Role, Tenant, UserSession } from '../types'

const tenants: Tenant[] = [
  { id: 't-001', name: '租户A' },
  { id: 't-002', name: '租户B' }
]

const users = [
  {
    userId: 'u-admin',
    username: 'admin',
    password: 'admin',
    roles: ['admin'] as Role[],
    permissions: [
      'user:read',
      'user:write',
      'audit:read',
      'report:read'
    ],
    dataScope: 'all' as DataScope
  },
  {
    userId: 'u-operator',
    username: 'operator',
    password: 'operator',
    roles: ['operator'] as Role[],
    permissions: ['user:read', 'report:read'],
    dataScope: 'dept' as DataScope
  },
  {
    userId: 'u-auditor',
    username: 'auditor',
    password: 'auditor',
    roles: ['auditor'] as Role[],
    permissions: ['audit:read'],
    dataScope: 'all' as DataScope
  }
]

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getTenants() {
  await sleep(150)
  return tenants
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  await sleep(300)
  const match = users.find(u => u.username === payload.username && u.password === payload.password)
  if (!match) {
    throw new Error('用户名或密码错误')
  }
  const tenant = tenants.find(t => t.id === payload.tenantId)
  if (!tenant) {
    throw new Error('租户不存在')
  }
  return {
    token: `mock.${match.userId}.${payload.tenantId}.${Date.now()}`,
    tenantId: payload.tenantId
  }
}

export async function getSession(token: string, tenantId: string): Promise<UserSession> {
  await sleep(250)
  const parts = token.split('.')
  if (parts.length < 4) throw new Error('token无效')
  const userId = parts[1]
  const user = users.find(u => u.userId === userId)
  if (!user) throw new Error('用户不存在')
  return {
    userId: user.userId,
    username: user.username,
    roles: user.roles,
    permissions: user.permissions,
    dataScope: user.dataScope,
    tenantId
  }
}

export async function getUserList(session: UserSession) {
  await sleep(220)
  const base = [
    { id: '1', name: '张三', dept: '研发', tenantId: session.tenantId },
    { id: '2', name: '李四', dept: '运营', tenantId: session.tenantId },
    { id: '3', name: '王五', dept: '审计', tenantId: session.tenantId }
  ]

  if (session.dataScope === 'self') {
    return base.slice(0, 1)
  }
  if (session.dataScope === 'dept') {
    const dept = session.roles.includes('operator') ? '运营' : (base[0]?.dept ?? '研发')
    return base.filter(x => x.dept === dept)
  }
  return base
}

export async function getAuditLogs(session: UserSession) {
  await sleep(220)
  return [
    { id: 'l1', action: 'LOGIN', actor: session.username, tenantId: session.tenantId, at: new Date().toISOString() },
    { id: 'l2', action: 'VIEW_REPORT', actor: session.username, tenantId: session.tenantId, at: new Date().toISOString() }
  ]
}

export async function getReport(session: UserSession) {
  await sleep(220)
  const all = [
    { id: 'r1', name: '总览', scope: 'all', tenantId: session.tenantId },
    { id: 'r2', name: '部门看板', scope: 'dept', tenantId: session.tenantId },
    { id: 'r3', name: '我的数据', scope: 'self', tenantId: session.tenantId }
  ]

  if (session.dataScope === 'all') return all
  if (session.dataScope === 'dept') return all.filter(x => x.scope !== 'all')
  return all.filter(x => x.scope === 'self')
}
