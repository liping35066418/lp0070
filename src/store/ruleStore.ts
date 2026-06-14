import { create } from 'zustand'
import type {
  PopupRule,
  GlobalSettings,
  TriggerLog,
  PopupState,
  WsMessage,
  ApiResponse,
} from '@/types'

interface RuleStore {
  rules: PopupRule[]
  settings: GlobalSettings | null
  popup: PopupState
  logs: TriggerLog[]
  wsConnected: boolean
  loading: boolean
  error: string | null

  fetchRules: () => Promise<void>
  addRule: (rule: Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<PopupRule | null>
  updateRule: (id: string, rule: Partial<PopupRule>) => Promise<PopupRule | null>
  deleteRule: (id: string) => Promise<boolean>
  toggleRule: (id: string) => Promise<PopupRule | null>
  reorderRules: (orderedIds: string[]) => Promise<PopupRule[] | null>

  fetchSettings: () => Promise<void>
  updateSettings: (settings: Partial<GlobalSettings>) => Promise<GlobalSettings | null>

  showPopup: (rule: PopupRule) => void
  hidePopup: () => void

  addLog: (log: TriggerLog) => void
  clearLogs: () => void

  connectWebSocket: () => void
  disconnectWebSocket: () => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const API_BASE = '/api'
const WS_URL = '/ws'

let ws: WebSocket | null = null

export const useRuleStore = create<RuleStore>((set, get) => ({
  rules: [],
  settings: null,
  popup: {
    visible: false,
    rule: null,
  },
  logs: [],
  wsConnected: false,
  loading: false,
  error: null,

  fetchRules: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules`)
      const data: ApiResponse<PopupRule[]> = await res.json()
      if (data.success && data.data) {
        set({ rules: data.data })
      } else {
        set({ error: data.error || '获取规则列表失败' })
      }
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  addRule: async (rule) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      })
      const data: ApiResponse<PopupRule> = await res.json()
      if (data.success && data.data) {
        set((state) => ({ rules: [...state.rules, data.data!] }))
        return data.data
      } else {
        set({ error: data.error || '添加规则失败' })
        return null
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  updateRule: async (id, rule) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      })
      const data: ApiResponse<PopupRule> = await res.json()
      if (data.success && data.data) {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? data.data! : r)),
        }))
        return data.data
      } else {
        set({ error: data.error || '更新规则失败' })
        return null
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  deleteRule: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules/${id}`, {
        method: 'DELETE',
      })
      const data: ApiResponse<void> = await res.json()
      if (data.success) {
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }))
        return true
      } else {
        set({ error: data.error || '删除规则失败' })
        return false
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return false
    } finally {
      set({ loading: false })
    }
  },

  toggleRule: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules/${id}/toggle`, {
        method: 'PATCH',
      })
      const data: ApiResponse<PopupRule> = await res.json()
      if (data.success && data.data) {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? data.data! : r)),
        }))
        return data.data
      } else {
        set({ error: data.error || '切换规则状态失败' })
        return null
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  reorderRules: async (orderedIds) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/rules/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      })
      const data: ApiResponse<PopupRule[]> = await res.json()
      if (data.success && data.data) {
        set({ rules: data.data })
        return data.data
      } else {
        set({ error: data.error || '重排规则失败' })
        return null
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/settings`)
      const data: ApiResponse<GlobalSettings> = await res.json()
      if (data.success && data.data) {
        set({ settings: data.data })
      } else {
        set({ error: data.error || '获取设置失败' })
      }
    } catch (err) {
      set({ error: (err as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  updateSettings: async (settings) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data: ApiResponse<GlobalSettings> = await res.json()
      if (data.success && data.data) {
        set({ settings: data.data })
        return data.data
      } else {
        set({ error: data.error || '更新设置失败' })
        return null
      }
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  showPopup: (rule) => {
    set({ popup: { visible: true, rule } })
  },

  hidePopup: () => {
    set((state) => ({ popup: { ...state.popup, visible: false } }))
  },

  addLog: (log) => {
    set((state) => ({ logs: [log, ...state.logs].slice(0, 100) }))
  },

  clearLogs: () => {
    set({ logs: [] })
  },

  connectWebSocket: () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}${WS_URL}`

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        set({ wsConnected: true })
      }

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data)
          const { addLog, showPopup, hidePopup } = get()

          switch (message.type) {
            case 'popup_show':
              if (message.data.rule) {
                showPopup(message.data.rule)
              }
              if (message.data.ruleId && message.data.ruleName) {
                addLog({
                  id: `log-${Date.now()}-${Math.random()}`,
                  ruleId: message.data.ruleId,
                  ruleName: message.data.ruleName,
                  triggerType: 'page_load',
                  action: 'show',
                  timestamp: message.data.timestamp,
                  details: message.data.details,
                })
              }
              break
            case 'popup_close':
              hidePopup()
              if (message.data.ruleId && message.data.ruleName) {
                addLog({
                  id: `log-${Date.now()}-${Math.random()}`,
                  ruleId: message.data.ruleId,
                  ruleName: message.data.ruleName,
                  triggerType: 'page_load',
                  action: 'close',
                  timestamp: message.data.timestamp,
                  details: message.data.details,
                })
              }
              break
            case 'log':
              if (message.data.ruleId && message.data.ruleName) {
                addLog({
                  id: `log-${Date.now()}-${Math.random()}`,
                  ruleId: message.data.ruleId,
                  ruleName: message.data.ruleName,
                  triggerType: 'page_load',
                  action: message.data.details?.includes('显示') ? 'show' : 'close',
                  timestamp: message.data.timestamp,
                  details: message.data.details,
                })
              }
              break
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err)
        }
      }

      ws.onerror = () => {
        set({ wsConnected: false })
      }

      ws.onclose = () => {
        set({ wsConnected: false })
      }
    } catch (err) {
      console.error('WebSocket connection error:', err)
      set({ wsConnected: false })
    }
  },

  disconnectWebSocket: () => {
    if (ws) {
      ws.close()
      ws = null
    }
    set({ wsConnected: false })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error })
  },
}))
