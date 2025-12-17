import type { Directive } from 'vue'
import { useAuth } from '../auth'

export const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const auth = useAuth()
    const session = auth.session.value
    if (!session) {
      el.remove()
      return
    }
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    const ok = required.every(p => session.permissions.includes(p))
    if (!ok) {
      el.remove()
    }
  }
}

