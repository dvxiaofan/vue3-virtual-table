import type { UserSession } from './types'

export interface RequestMeta {
  headers: Record<string, string>
}

export function buildRequestMeta(session: UserSession): RequestMeta {
  return {
    headers: {
      Authorization: `Bearer mock.${session.userId}`,
      'X-Tenant-Id': session.tenantId,
      'X-Data-Scope': session.dataScope
    }
  }
}

