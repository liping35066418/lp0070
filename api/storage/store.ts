import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type {
  PopupRule,
  GlobalSettings,
  TriggerLog,
} from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data')
const RULES_FILE = path.join(DATA_DIR, 'rules.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const MAX_LOGS = 100

let rules: PopupRule[] = []
let settings: GlobalSettings | null = null
let triggerLogs: TriggerLog[] = []
let initialized = false

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function getDefaultRules(): PopupRule[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'rule-1',
      name: '页面加载欢迎弹窗',
      enabled: true,
      trigger: { type: 'page_load', delay: 1 },
      position: { vertical: 'center', horizontal: 'center', offsetX: 0, offsetY: 0 },
      close: { button: true, mask: false, timeout: 0, escape: true },
      style: {
        width: 400,
        height: 'auto',
        borderRadius: 12,
        animation: 'spring',
        maskColor: '#000000',
        maskOpacity: 0.6,
        maskBlur: 4,
      },
      content: {
        title: '欢迎使用弹窗调度平台',
        body: '这是一个页面加载触发的弹窗示例，支持丰富的配置项。',
        confirmText: '知道了',
        cancelText: '关闭',
      },
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rule-2',
      name: '点击按钮提示',
      enabled: true,
      trigger: { type: 'click', delay: 0, clickSelector: '#test-btn' },
      position: { vertical: 'bottom', horizontal: 'right', offsetX: 20, offsetY: 20 },
      close: { button: true, mask: false, timeout: 3, escape: true },
      style: {
        width: 320,
        height: 'auto',
        borderRadius: 8,
        animation: 'slide',
        maskColor: '#000000',
        maskOpacity: 0,
        maskBlur: 0,
      },
      content: {
        title: '操作成功',
        body: '您的点击操作已被捕获，这是一个无遮罩弹窗。',
      },
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rule-3',
      name: '停留3秒推荐',
      enabled: true,
      trigger: { type: 'dwell', delay: 0, dwellTime: 3 },
      position: { vertical: 'center', horizontal: 'left', offsetX: 30, offsetY: 0 },
      close: { button: true, mask: false, timeout: 5, escape: true },
      style: {
        width: 360,
        height: 'auto',
        borderRadius: 10,
        animation: 'scale',
        maskColor: '#000000',
        maskOpacity: 0.3,
        maskBlur: 2,
      },
      content: {
        title: '温馨提示',
        body: '检测到您停留了3秒钟，为您推荐更多精彩内容。',
        confirmText: '查看更多',
      },
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rule-4',
      name: '定时提醒',
      enabled: false,
      trigger: { type: 'timer', delay: 0, timerInterval: 10 },
      position: { vertical: 'top', horizontal: 'center', offsetX: 0, offsetY: 20 },
      close: { button: true, mask: false, timeout: 3, escape: false },
      style: {
        width: 380,
        height: 'auto',
        borderRadius: 8,
        animation: 'fade',
        maskColor: '#000000',
        maskOpacity: 0,
        maskBlur: 0,
      },
      content: {
        title: '定时提醒',
        body: '这是一个由定时器触发的提醒消息。',
      },
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function loadRules(): PopupRule[] {
  ensureDataDir()
  if (fs.existsSync(RULES_FILE)) {
    try {
      const data = fs.readFileSync(RULES_FILE, 'utf-8')
      return JSON.parse(data)
    } catch {
      return getDefaultRules()
    }
  }
  return getDefaultRules()
}

function saveRules(): void {
  ensureDataDir()
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf-8')
}

function getDefaultSettings(): GlobalSettings {
  return {
    maskColor: '#000000',
    maskOpacity: 0.6,
    maskBlur: 4,
    maskCloseOnClick: true,
    defaultPosition: { vertical: 'center', horizontal: 'center', offsetX: 0, offsetY: 0 },
    defaultAnimation: 'spring',
    defaultWidth: 400,
    defaultHeight: 'auto',
    defaultBorderRadius: 12,
    theme: 'dark',
    accentColor: '#00D4AA',
  }
}

function loadSettings(): GlobalSettings {
  ensureDataDir()
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch {
      return getDefaultSettings()
    }
  }
  return getDefaultSettings()
}

function saveSettings(): void {
  ensureDataDir()
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

export function initStore(): void {
  if (initialized) return
  rules = loadRules()
  settings = loadSettings()
  initialized = true
}

export function getAllRules(): PopupRule[] {
  if (!initialized) initStore()
  return [...rules].sort((a, b) => a.order - b.order)
}

export function getRuleById(id: string): PopupRule | undefined {
  if (!initialized) initStore()
  return rules.find((r) => r.id === id)
}

export function getEnabledRules(): PopupRule[] {
  if (!initialized) initStore()
  return rules.filter((r) => r.enabled).sort((a, b) => a.order - b.order)
}

export function createRule(
  ruleData: Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>,
): PopupRule {
  if (!initialized) initStore()
  const now = new Date().toISOString()
  const newRule: PopupRule = {
    ...ruleData,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    order: rules.length + 1,
    createdAt: now,
    updatedAt: now,
  }
  rules.push(newRule)
  saveRules()
  return newRule
}

export function updateRule(id: string, updates: Partial<PopupRule>): PopupRule | null {
  if (!initialized) initStore()
  const index = rules.findIndex((r) => r.id === id)
  if (index === -1) return null
  rules[index] = { ...rules[index], ...updates, updatedAt: new Date().toISOString() }
  saveRules()
  return rules[index]
}

export function deleteRule(id: string): boolean {
  if (!initialized) initStore()
  const index = rules.findIndex((r) => r.id === id)
  if (index === -1) return false
  rules.splice(index, 1)
  saveRules()
  return true
}

export function toggleRule(id: string): PopupRule | null {
  if (!initialized) initStore()
  const rule = rules.find((r) => r.id === id)
  if (!rule) return null
  rule.enabled = !rule.enabled
  rule.updatedAt = new Date().toISOString()
  saveRules()
  return rule
}

export function reorderRules(orderedIds: string[]): PopupRule[] {
  if (!initialized) initStore()
  const idOrder = new Map(orderedIds.map((id, idx) => [id, idx + 1]))
  rules.forEach((r) => {
    const order = idOrder.get(r.id)
    if (order !== undefined) {
      r.order = order
      r.updatedAt = new Date().toISOString()
    }
  })
  saveRules()
  return getAllRules()
}

export function getSettings(): GlobalSettings {
  if (!initialized) initStore()
  if (!settings) settings = loadSettings()
  return { ...settings }
}

export function updateSettings(updates: Partial<GlobalSettings>): GlobalSettings {
  if (!initialized) initStore()
  if (!settings) settings = loadSettings()
  settings = { ...settings, ...updates }
  saveSettings()
  return { ...settings }
}

export function addTriggerLog(log: Omit<TriggerLog, 'id'>): TriggerLog {
  const newLog: TriggerLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
  triggerLogs.unshift(newLog)
  if (triggerLogs.length > MAX_LOGS) {
    triggerLogs = triggerLogs.slice(0, MAX_LOGS)
  }
  return newLog
}

export function getTriggerLogs(): TriggerLog[] {
  return [...triggerLogs]
}
