import type { Router } from 'vue-router'
import { useAuth } from './auth'
import { hasAccess } from './permission'
import { syncPermissionRoutes } from './routes'

let lastSyncedTenant: string | null = null
let lastSyncedUser: string | null = null

export function installAuthGuards(router: Router) {
  router.beforeEach(async to => {
    if ((to.meta as any)?.public) return true

    const auth = useAuth()
    if (!auth.isAuthed.value) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }

    const session = await auth.ensureSessionLoaded()
    if (!session) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }

    const shouldSync =
      session.tenantId !== lastSyncedTenant ||
      session.userId !== lastSyncedUser

    if (shouldSync) {
      syncPermissionRoutes(router, session)
      lastSyncedTenant = session.tenantId
      lastSyncedUser = session.userId

      const resolved = router.resolve(to.fullPath)
      if (resolved.matched.length === 0) {
        return { path: to.fullPath, replace: true }
      }
    }

    const accessRecords = to.matched
      .map(r => (r.meta as any)?.access)
      .filter(Boolean)

    const allowed = accessRecords.every(access =>
      hasAccess(session.roles, session.permissions, access)
    )

    if (!allowed) {
      return { path: '/403' }
    }

    return true
  })
}

