import type { Router, RouteRecordRaw } from 'vue-router'
import type { UserSession } from './types'
import { hasAccess } from './permission'
import UserManageView from '@/views/permission/UserManageView.vue'
import AuditLogView from '@/views/permission/AuditLogView.vue'
import ReportView from '@/views/permission/ReportView.vue'

export interface PermissionNavItem {
  name: string
  path: string
  title: string
}

const dynamicRouteNames = new Set<string>()

function getBlueprints(): RouteRecordRaw[] {
  return [
    {
      path: 'users',
      name: 'permission-users',
      component: UserManageView,
      meta: { title: '用户管理', access: { permissions: ['user:read'] } }
    },
    {
      path: 'audit',
      name: 'permission-audit',
      component: AuditLogView,
      meta: { title: '审计日志', access: { permissions: ['audit:read'] } }
    },
    {
      path: 'report',
      name: 'permission-report',
      component: ReportView,
      meta: { title: '报表', access: { permissions: ['report:read'] } }
    }
  ]
}

function isAllowed(session: UserSession, route: RouteRecordRaw) {
  const access = (route.meta as any)?.access as { roles?: any; permissions?: any } | undefined
  return hasAccess(session.roles, session.permissions, access)
}

export function resetPermissionRoutes(router: Router) {
  for (const name of dynamicRouteNames) {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  }
  dynamicRouteNames.clear()
}

export function syncPermissionRoutes(router: Router, session: UserSession) {
  resetPermissionRoutes(router)
  const allowed = getBlueprints().filter(r => isAllowed(session, r))
  for (const route of allowed) {
    router.addRoute('permission-root', route)
    if (route.name) dynamicRouteNames.add(String(route.name))
  }
}

export function listPermissionNav(router: Router): PermissionNavItem[] {
  const items: PermissionNavItem[] = router
    .getRoutes()
    .filter(r => typeof r.name === 'string' && String(r.name).startsWith('permission-'))
    .filter(r => r.meta && (r.meta as any).title)
    .map(r => ({
      name: String(r.name),
      path: r.path,
      title: String((r.meta as any).title)
    }))

  const unique = new Map<string, PermissionNavItem>(items.map(i => [i.name, i]))
  return Array.from(unique.values()).sort((a, b) => a.path.localeCompare(b.path))
}
