import {
  getAllRules,
  getRuleById,
  getEnabledRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
  reorderRules,
  getSettings,
  updateSettings,
} from '../storage/store.js'
import type { PopupRule, GlobalSettings } from '../types/index.js'

export function listRules(): PopupRule[] {
  return getAllRules()
}

export function getRule(id: string): PopupRule | undefined {
  return getRuleById(id)
}

export function listEnabledRules(): PopupRule[] {
  return getEnabledRules()
}

export function addRule(
  ruleData: Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>,
): PopupRule {
  validateRuleData(ruleData)
  return createRule(ruleData)
}

export function modifyRule(
  id: string,
  updates: Partial<PopupRule>,
): PopupRule | null {
  if (updates.name !== undefined && updates.name.trim() === '') {
    throw new Error('规则名称不能为空')
  }
  return updateRule(id, updates)
}

export function removeRule(id: string): boolean {
  return deleteRule(id)
}

export function switchRuleEnabled(id: string): PopupRule | null {
  return toggleRule(id)
}

export function sortRules(orderedIds: string[]): PopupRule[] {
  return reorderRules(orderedIds)
}

export function getGlobalSettings(): GlobalSettings {
  return getSettings()
}

export function modifyGlobalSettings(
  updates: Partial<GlobalSettings>,
): GlobalSettings {
  return updateSettings(updates)
}

function validateRuleData(
  ruleData: Omit<PopupRule, 'id' | 'createdAt' | 'updatedAt' | 'order'>,
): void {
  if (!ruleData.name || ruleData.name.trim() === '') {
    throw new Error('规则名称不能为空')
  }
  if (!ruleData.trigger || !ruleData.trigger.type) {
    throw new Error('触发类型不能为空')
  }
  if (!ruleData.position) {
    throw new Error('位置配置不能为空')
  }
  if (!ruleData.close) {
    throw new Error('关闭配置不能为空')
  }
  if (!ruleData.style) {
    throw new Error('样式配置不能为空')
  }
  if (!ruleData.content) {
    throw new Error('内容配置不能为空')
  }
}
