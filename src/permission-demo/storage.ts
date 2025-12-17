export interface CacheEnvelope<T> {
  value: T
  expiresAt: number
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  const envelope: CacheEnvelope<T> = {
    value,
    expiresAt: Date.now() + ttlMs
  }
  localStorage.setItem(key, JSON.stringify(envelope))
}

export function getCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const envelope = JSON.parse(raw) as CacheEnvelope<T>
    if (!envelope?.expiresAt || envelope.expiresAt <= Date.now()) {
      localStorage.removeItem(key)
      return null
    }
    return envelope.value
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function removeCache(key: string) {
  localStorage.removeItem(key)
}

