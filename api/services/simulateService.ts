import { getRuleById, getEnabledRules, addTriggerLog } from '../storage/store.js'
import {
  sendPopupShow,
  sendPopupClose,
  sendCycleStart,
  sendCycleStep,
  sendCycleEnd,
  sendLog,
} from '../websocket/wsManager.js'
import type { PopupRule, CycleTestConfig, TriggerType } from '../types/index.js'

let cycleRunning = false
let cycleTimer: ReturnType<typeof setInterval> | null = null
let cycleIndex = 0
let cycleRepeat = 0
let currentCycleRules: PopupRule[] = []

export function triggerPopup(ruleId: string): PopupRule | null {
  const rule = getRuleById(ruleId)
  if (!rule) {
    return null
  }

  if (!rule.enabled) {
    sendLog(`规则「${rule.name}」已禁用，跳过触发`, rule.id, rule.name)
    return rule
  }

  sendPopupShow(rule)
  addTriggerLog({
    ruleId: rule.id,
    ruleName: rule.name,
    triggerType: rule.trigger.type,
    action: 'show',
    timestamp: Date.now(),
    details: '模拟触发弹窗',
  })

  if (rule.close.timeout > 0) {
    setTimeout(() => {
      sendPopupClose(rule.id, rule.name)
      addTriggerLog({
        ruleId: rule.id,
        ruleName: rule.name,
        triggerType: rule.trigger.type,
        action: 'close',
        timestamp: Date.now(),
        details: '自动关闭',
      })
    }, rule.close.timeout)
  }

  return rule
}

export function matchRulesByTrigger(triggerType: TriggerType): PopupRule[] {
  const enabledRules = getEnabledRules()
  return enabledRules.filter((rule) => rule.trigger.type === triggerType)
}

export function startCycleTest(config: CycleTestConfig): {
  success: boolean
  message: string
  totalSteps: number
} {
  if (cycleRunning) {
    return {
      success: false,
      message: '循环测试正在运行中，请先停止',
      totalSteps: 0,
    }
  }

  const rules: PopupRule[] = []
  for (const ruleId of config.ruleIds) {
    const rule = getRuleById(ruleId)
    if (rule && rule.enabled) {
      rules.push(rule)
    }
  }

  if (rules.length === 0) {
    return {
      success: false,
      message: '没有可用的启用规则',
      totalSteps: 0,
    }
  }

  const totalSteps = rules.length * config.repeat
  currentCycleRules = rules
  cycleRepeat = config.repeat
  cycleIndex = 0
  cycleRunning = true

  sendCycleStart(totalSteps)
  sendLog(`循环测试启动：${rules.length} 条规则，重复 ${config.repeat} 次，间隔 ${config.interval}ms`)

  executeCycleStep(config.interval)

  return {
    success: true,
    message: '循环测试已启动',
    totalSteps,
  }
}

function executeCycleStep(interval: number): void {
  if (!cycleRunning || cycleIndex >= currentCycleRules.length * cycleRepeat) {
    stopCycleTest()
    return
  }

  const ruleIndex = cycleIndex % currentCycleRules.length
  const rule = currentCycleRules[ruleIndex]
  const totalSteps = currentCycleRules.length * cycleRepeat

  sendCycleStep(rule, cycleIndex, totalSteps)
  sendPopupShow(rule)
  addTriggerLog({
    ruleId: rule.id,
    ruleName: rule.name,
    triggerType: rule.trigger.type,
    action: 'show',
    timestamp: Date.now(),
    details: `循环测试第 ${cycleIndex + 1} 步`,
  })

  cycleIndex++

  cycleTimer = setTimeout(() => {
    sendPopupClose(rule.id, rule.name)
    addTriggerLog({
      ruleId: rule.id,
      ruleName: rule.name,
      triggerType: rule.trigger.type,
      action: 'close',
      timestamp: Date.now(),
      details: '循环测试自动关闭',
    })

    if (cycleRunning && cycleIndex < currentCycleRules.length * cycleRepeat) {
      cycleTimer = setTimeout(() => {
        executeCycleStep(interval)
      }, interval)
    } else {
      stopCycleTest()
    }
  }, Math.min(interval, 2000))
}

export function stopCycleTest(): {
  success: boolean
  message: string
} {
  if (cycleTimer) {
    clearTimeout(cycleTimer)
    cycleTimer = null
  }

  const wasRunning = cycleRunning
  const totalSteps = currentCycleRules.length * cycleRepeat

  cycleRunning = false
  cycleIndex = 0
  currentCycleRules = []
  cycleRepeat = 0

  if (wasRunning) {
    sendCycleEnd(totalSteps)
    sendLog('循环测试已结束')
  }

  return {
    success: true,
    message: wasRunning ? '循环测试已停止' : '循环测试未在运行',
  }
}

export function isCycleRunning(): boolean {
  return cycleRunning
}

export function triggerByType(triggerType: TriggerType): {
  success: boolean
  message: string
  matchedCount: number
  rules: PopupRule[]
} {
  const matchedRules = matchRulesByTrigger(triggerType)

  if (matchedRules.length === 0) {
    return {
      success: false,
      message: `没有匹配到 ${triggerType} 类型的启用规则`,
      matchedCount: 0,
      rules: [],
    }
  }

  matchedRules.forEach((rule, index) => {
    const delay = rule.trigger.delay + index * 500
    setTimeout(() => {
      triggerPopup(rule.id)
    }, delay)
  })

  return {
    success: true,
    message: `已触发 ${matchedRules.length} 条 ${triggerType} 类型规则`,
    matchedCount: matchedRules.length,
    rules: matchedRules,
  }
}
