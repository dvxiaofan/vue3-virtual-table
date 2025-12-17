import { computed, ref } from 'vue'
import { getCache, removeCache, setCache } from './storage'
import type { LoginPayload, Tenant, UserSession } from './types'
import { getSession, getTenants, login as apiLogin } from './mock/api'

const TOKEN_KEY = 'permission-demo.token'
const TENANT_KEY = 'permission-demo.tenantId'
const SESSION_KEY = 'permission-demo.session'

const sessionRef = ref<UserSession | null>(null)
const tokenRef = ref<string | null>(null)
const tenantIdRef = ref<string | null>(null)
const tenantsRef = ref<Tenant[]>([])

function loadPersisted() {
  tokenRef.value = localStorage.getItem(TOKEN_KEY)
  tenantIdRef.value = localStorage.getItem(TENANT_KEY)
  const cachedSession = getCache<UserSession>(SESSION_KEY)
  if (cachedSession) sessionRef.value = cachedSession
}

loadPersisted()

export function useAuth() {
  const isAuthed = computed(() => Boolean(tokenRef.value && tenantIdRef.value))
  const session = computed(() => sessionRef.value)

  async function ensureTenantsLoaded() {
    if (tenantsRef.value.length > 0) return tenantsRef.value
    tenantsRef.value = await getTenants()
    return tenantsRef.value
  }

  async function ensureSessionLoaded(force = false) {
    if (!tokenRef.value || !tenantIdRef.value) {
      sessionRef.value = null
      removeCache(SESSION_KEY)
      return null
    }

    if (!force && sessionRef.value?.tenantId === tenantIdRef.value) {
      return sessionRef.value
    }

    const cached = !force ? getCache<UserSession>(SESSION_KEY) : null
    if (cached && cached.tenantId === tenantIdRef.value) {
      sessionRef.value = cached
      return cached
    }

    const fresh = await getSession(tokenRef.value, tenantIdRef.value)
    sessionRef.value = fresh
    setCache(SESSION_KEY, fresh, 10 * 60 * 1000)
    return fresh
  }

  async function login(payload: LoginPayload) {
    const result = await apiLogin(payload)
    tokenRef.value = result.token
    tenantIdRef.value = result.tenantId
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(TENANT_KEY, result.tenantId)
    await ensureSessionLoaded(true)
  }

  function logout() {
    tokenRef.value = null
    tenantIdRef.value = null
    sessionRef.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TENANT_KEY)
    removeCache(SESSION_KEY)
  }

  async function switchTenant(tenantId: string) {
    tenantIdRef.value = tenantId
    localStorage.setItem(TENANT_KEY, tenantId)
    sessionRef.value = null
    removeCache(SESSION_KEY)
    await ensureSessionLoaded(true)
  }

  return {
    isAuthed,
    session,
    token: computed(() => tokenRef.value),
    tenantId: computed(() => tenantIdRef.value),
    tenants: computed(() => tenantsRef.value),
    ensureTenantsLoaded,
    ensureSessionLoaded,
    login,
    logout,
    switchTenant
  }
}

